import { getChatGPTUser } from "@/app/chatgpt-auth";
import { listCourseUsers } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";

export async function GET() {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Требуется вход" }, { status: 401 });
  if (!isAdminEmail(identity.email)) return Response.json({ error: "Недостаточно прав" }, { status: 403 });
  try {
    const users = await listCourseUsers();
    return Response.json({ users }, { headers: { "cache-control": "no-store" } });
  } catch {
    return Response.json({ error: "Не удалось загрузить заявки. Повторите попытку." }, { status: 503 });
  }
}
