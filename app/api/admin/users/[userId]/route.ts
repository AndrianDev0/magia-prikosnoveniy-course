import { getChatGPTUser } from "@/app/chatgpt-auth";
import { updateUserAccess } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";

const actions = new Set(["approve", "reject", "grant", "revoke"] as const);

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const identity = await getChatGPTUser();
    if (!identity) return Response.json({ error: "Требуется вход" }, { status: 401 });
    if (!isAdminEmail(identity.email)) return Response.json({ error: "Недостаточно прав" }, { status: 403 });
    const origin = request.headers.get("origin");
    if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
      return Response.json({ error: "Запрос с другого сайта отклонён" }, { status: 403 });
    }
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      return Response.json({ error: "Ожидается JSON" }, { status: 415 });
    }
    const { userId } = await params;
    const input = (await request.json()) as { action?: string };
    if (!input.action || !actions.has(input.action as "approve" | "reject" | "grant" | "revoke")) return Response.json({ error: "Неизвестное действие" }, { status: 400 });
    const user = await updateUserAccess(userId, input.action as "approve" | "reject" | "grant" | "revoke");
    return Response.json({ user }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    const known = error instanceof Error && ["Пользователь не найден", "Актуальная заявка на выбранный тариф не найдена"].includes(error.message);
    return Response.json({ error: known ? error.message : "Не удалось сохранить изменение. Повторите попытку." }, { status: known ? 409 : 503 });
  }
}
