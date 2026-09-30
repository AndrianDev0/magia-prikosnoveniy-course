import { getChatGPTUser } from "@/app/chatgpt-auth";
import { updateUserAccess } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";

const actions = new Set(["approve", "reject", "grant", "revoke"] as const);

export async function POST(request: Request, { params }: { params: Promise<{ userId: string }> }) {
  const identity = await getChatGPTUser();
  if (!identity) return Response.json({ error: "Требуется вход" }, { status: 401 });
  if (!isAdminEmail(identity.email)) return Response.json({ error: "Недостаточно прав" }, { status: 403 });
  const { userId } = await params;
  const input = (await request.json()) as { action?: string };
  if (!input.action || !actions.has(input.action as "approve" | "reject" | "grant" | "revoke")) return Response.json({ error: "Неизвестное действие" }, { status: 400 });
  const user = await updateUserAccess(userId, input.action as "approve" | "reject" | "grant" | "revoke");
  return Response.json({ user });
}
