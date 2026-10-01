import { getChatGPTUser } from "@/app/chatgpt-auth";
import { planById, type PlanId } from "@/config/site";
import { ensureCourseUser, updateCourseProfile } from "@/db/users";

export async function PUT(request: Request) {
  try {
    const identity = await getChatGPTUser();
    if (!identity) return Response.json({ error: "Требуется вход" }, { status: 401 });
    const input = (await request.json()) as { name?: string; phone?: string; selectedPlan?: string };
    const name = input.name?.trim() ?? "";
    const phone = input.phone?.trim() ?? "";
    const plan = planById(input.selectedPlan);
    if (name.length < 2) return Response.json({ error: "Укажите имя" }, { status: 400 });
    if (phone.replace(/\D/g, "").length < 7) return Response.json({ error: "Укажите корректный телефон" }, { status: 400 });
    if (!plan) return Response.json({ error: "Выберите тариф" }, { status: 400 });
    await ensureCourseUser(identity);
    const user = await updateCourseProfile(identity.userId, { name, phone, selectedPlan: plan.id as PlanId });
    return Response.json({ user });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не удалось сохранить профиль" }, { status: 400 });
  }
}
