import { getChatGPTUser } from "@/app/chatgpt-auth";
import { planById, type PlanId } from "@/config/site";
import { ensureCourseUser, submitPaymentRequest } from "@/db/users";

export async function POST(request: Request) {
  try {
    const identity = await getChatGPTUser();
    if (!identity) return Response.json({ error: "Требуется вход" }, { status: 401 });
    const input = (await request.json()) as { planId?: string };
    const plan = planById(input.planId);
    if (!plan) return Response.json({ error: "Тариф не найден" }, { status: 400 });
    const user = await ensureCourseUser(identity);
    if (!user.name || !user.phone) return Response.json({ error: "Заполните имя и телефон" }, { status: 400 });
    const result = await submitPaymentRequest(identity.userId, plan.id as PlanId);
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Не удалось отправить заявку" }, { status: 400 });
  }
}
