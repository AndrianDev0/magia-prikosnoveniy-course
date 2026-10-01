import { planById, type PlanId } from "@/config/site";
import { submitPublicPaymentLead } from "@/db/users";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    const input = (await request.json()) as { name?: string; email?: string; phone?: string; planId?: string };
    const name = input.name?.trim() ?? "";
    const email = input.email?.trim().toLowerCase() ?? "";
    const phone = input.phone?.trim() ?? "";
    const plan = planById(input.planId);
    if (name.length < 2) return Response.json({ error: "Укажите имя" }, { status: 400 });
    if (!emailPattern.test(email)) return Response.json({ error: "Укажите корректную почту" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 7) return Response.json({ error: "Укажите корректный телефон" }, { status: 400 });
    if (!plan) return Response.json({ error: "Выберите тариф" }, { status: 400 });
    const result = await submitPublicPaymentLead({ name, email, phone, planId: plan.id as PlanId });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не удалось отправить заявку" }, { status: 400 });
  }
}
