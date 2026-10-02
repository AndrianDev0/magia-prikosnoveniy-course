import type { Metadata } from "next";
import { requireChatGPTUser, chatGPTSignInPath, chatGPTSignOutPath } from "@/app/chatgpt-auth";
import { AdminClient } from "@/components/course/admin-client";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { listCourseUsers } from "@/db/users";
import { isAdminEmail } from "@/lib/authz";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Администратор", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const identity = await requireChatGPTUser("/admin");
  const admin = isAdminEmail(identity.email);
  const header = { user: { displayName: identity.displayName }, signInPath: chatGPTSignInPath("/admin"), signOutPath: chatGPTSignOutPath("/"), isAdmin: admin };
  if (!admin) {
    return <div className="site-shell gate-page"><SiteHeader {...header} /><main className="gate-main section"><p className="eyebrow">Защищённый раздел</p><h1 className="display-title">Нет доступа</h1><p>Эта страница доступна только администратору курса.</p><a className="button button-primary" href="/profile">В личный кабинет</a></main><SiteFooter /></div>;
  }
  let users: Awaited<ReturnType<typeof listCourseUsers>> = [];
  let loadError = "";
  try {
    users = await listCourseUsers();
  } catch {
    loadError = "Не удалось загрузить заявки. Проверьте подключение базы и обновите список.";
  }
  return <AdminClient header={header} initialUsers={users} initialLoadError={loadError} />;
}
