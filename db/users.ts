import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "@/db";
import { paymentRequests, users } from "@/db/schema";
import type { ChatGPTUser } from "@/app/chatgpt-auth";
import { planById, type PlanId } from "@/config/site";

export type CourseUser = typeof users.$inferSelect;

function hasLiveAccess(user: CourseUser) {
  return user.accessGranted && (!user.accessExpiresAt || new Date(user.accessExpiresAt).getTime() > Date.now());
}

export async function ensureCourseUser(identity: ChatGPTUser): Promise<CourseUser> {
  const db = getDb();
  const initialName = identity.fullName ?? "";
  await db
    .insert(users)
    .values({ id: identity.userId, email: identity.email, name: initialName })
    .onConflictDoUpdate({
      target: users.id,
      set: { email: identity.email, updatedAt: new Date().toISOString() },
    });
  const [user] = await db.select().from(users).where(eq(users.id, identity.userId)).limit(1);
  if (!user) throw new Error("Не удалось создать профиль");
  return user;
}

export async function updateCourseProfile(
  userId: string,
  values: { name: string; phone: string; selectedPlan: PlanId },
) {
  const db = getDb();
  const [current] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!current) throw new Error("Пользователь не найден");
  if (
    current.selectedPlan &&
    current.selectedPlan !== values.selectedPlan &&
    (current.paymentStatus === "pending" || (current.paymentStatus === "confirmed" && hasLiveAccess(current)))
  ) {
    throw new Error(
      current.paymentStatus === "pending"
        ? "Нельзя менять тариф, пока заявка ожидает подтверждения"
        : "Нельзя менять тариф после подтверждения оплаты",
    );
  }
  await db
    .update(users)
    .set({ ...values, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return user;
}

export async function submitPaymentRequest(userId: string, planId: PlanId) {
  const plan = planById(planId);
  if (!plan) throw new Error("Тариф не найден");
  const db = getDb();
  const [current] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!current) throw new Error("Пользователь не найден");
  if (current.paymentStatus === "pending") {
    throw new Error("Заявка уже ожидает подтверждения");
  }
  if (current.paymentStatus === "confirmed" && hasLiveAccess(current)) {
    throw new Error("Оплата уже подтверждена");
  }
  const [existing] = await db
    .select()
    .from(paymentRequests)
    .where(
      and(
        eq(paymentRequests.userId, userId),
        eq(paymentRequests.status, "pending"),
      ),
    )
    .limit(1);

  if (existing) throw new Error("Заявка уже ожидает подтверждения");

  await db.insert(paymentRequests).values({
    id: crypto.randomUUID(),
    userId,
    planId,
    amount: plan.price,
    status: "pending",
  });

  await db
    .update(users)
    .set({
      selectedPlan: planId,
      paymentStatus: "pending",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, userId));

  return { status: "pending" as const, alreadyPending: false };
}

export async function submitPublicPaymentLead(values: { name: string; email: string; phone: string; planId: PlanId }) {
  const db = getDb();
  const email = values.email.trim().toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing?.paymentStatus === "pending") return { status: "pending" as const, alreadyPending: true };
  if (existing && existing.paymentStatus === "confirmed" && hasLiveAccess(existing)) throw new Error("Для этой почты оплата уже подтверждена");

  const userId = existing?.id ?? crypto.randomUUID();
  if (existing) {
    await db.update(users).set({ name: values.name, phone: values.phone, selectedPlan: values.planId, paymentStatus: "not_paid", accessGranted: false, accessGrantedAt: null, accessExpiresAt: null, updatedAt: new Date().toISOString() }).where(eq(users.id, userId));
  } else {
    await db.insert(users).values({ id: userId, email, name: values.name, phone: values.phone, selectedPlan: values.planId });
  }
  return submitPaymentRequest(userId, values.planId);
}

export async function listCourseUsers() {
  return getDb().select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserAccess(
  userId: string,
  action: "approve" | "reject" | "grant" | "revoke",
) {
  const db = getDb();
  const [current] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!current) throw new Error("Пользователь не найден");

  const now = new Date();
  const standardExpiry = new Date(now);
  standardExpiry.setFullYear(standardExpiry.getFullYear() + 1);

  const [activePaymentRequest] =
    action === "approve" || action === "reject"
      ? await db
          .select()
          .from(paymentRequests)
          .where(
            and(
              eq(paymentRequests.userId, userId),
              eq(paymentRequests.planId, current.selectedPlan ?? ""),
              eq(paymentRequests.status, "pending"),
            ),
          )
          .orderBy(desc(paymentRequests.createdAt))
          .limit(1)
      : [undefined];

  if ((action === "approve" || action === "reject") && !activePaymentRequest) {
    throw new Error("Актуальная заявка на выбранный тариф не найдена");
  }

  const next =
    action === "approve"
      ? {
          paymentStatus: "confirmed",
          accessGranted: true,
          accessGrantedAt: now.toISOString(),
          accessExpiresAt:
            current.selectedPlan === "standard" ? standardExpiry.toISOString() : null,
        }
      : action === "reject"
        ? { paymentStatus: "rejected", accessGranted: false, accessGrantedAt: null, accessExpiresAt: null }
        : action === "grant"
          ? {
              accessGranted: true,
              accessGrantedAt: now.toISOString(),
              accessExpiresAt:
                current.selectedPlan === "standard" ? standardExpiry.toISOString() : null,
            }
          : { accessGranted: false, accessGrantedAt: null, accessExpiresAt: null };

  const updateUser = db
    .update(users)
    .set({ ...next, updatedAt: now.toISOString() })
    .where(eq(users.id, userId));

  if ((action === "approve" || action === "reject") && activePaymentRequest) {
    await db.batch([
      db
        .update(paymentRequests)
        .set({ status: "rejected", updatedAt: now.toISOString() })
        .where(
          and(
            eq(paymentRequests.userId, userId),
            eq(paymentRequests.status, "pending"),
            ne(paymentRequests.id, activePaymentRequest.id),
          ),
        ),
      db
        .update(paymentRequests)
        .set({
          status: action === "approve" ? "confirmed" : "rejected",
          updatedAt: now.toISOString(),
        })
        .where(
          and(
            eq(paymentRequests.id, activePaymentRequest.id),
            eq(paymentRequests.status, "pending"),
          ),
        ),
      updateUser,
    ]);
  } else {
    await updateUser;
  }
  const [updated] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return updated;
}
