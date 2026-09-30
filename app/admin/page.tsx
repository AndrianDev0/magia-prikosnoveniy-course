import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { AdminClient } from "@/components/course/admin-client";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { listCourseUsers } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Администратор" };

export default async function AdminPage() {
  const identity = await requireChatGPTUser("/admin");
  const admin = isAdminEmail(identity.email);
  const header = { user: { displayName: identity.displayName }, signInPath: chatGPTSignInPath("/admin"), signOutPath: chatGPTSignOutPath("/"), isAdmin: admin };
  if (!admin) {
    return <div className="site-shell gate-page"><SiteHeader {...header} /><main className="gate-main section"><p className="eyebrow">Защищённый раздел</p><h1 className="display-title">Нет доступа</h1><p>Эта страница доступна только администратору курса.</p><a className="button button-primary" href="/profile">В личный кабинет</a></main><SiteFooter /></div>;
  }
  const users = await listCourseUsers();
  return <AdminClient header={header} initialUsers={users} />;
}
