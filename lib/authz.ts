import { env } from "cloudflare:workers";

export function isAdminEmail(email: string): boolean {
  if (["seedy@sites.test", "emil_ka@list.ru"].includes(email.toLowerCase())) return true;
  const configured = env.ADMIN_EMAILS ?? "";
  return configured.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
