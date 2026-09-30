"use client";

import { useState } from "react";
import { CheckCircle2, Shield, ShieldOff, XCircle } from "lucide-react";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { planById } from "@/config/site";
import { isAccessExpired } from "@/lib/access";

type Header = Parameters<typeof SiteHeader>[0];
type UserRow = {
  id: string; email: string; name: string; phone: string; selectedPlan: string | null;
  paymentStatus: string; accessGranted: boolean; accessGrantedAt: string | null;
  accessExpiresAt: string | null; createdAt: string; updatedAt: string;
};

const labels: Record<string, string> = { not_paid: "Не оплачено", pending: "Ожидает подтверждения", confirmed: "Подтверждено", rejected: "Отклонено" };
const hasActiveAccess = (user: UserRow) => user.accessGranted && !isAccessExpired(user.accessExpiresAt);

export function AdminClient({ header, initialUsers }: { header: Header; initialUsers: UserRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function act(userId: string, action: "approve" | "reject" | "grant" | "revoke") {
    setBusy(`${userId}:${action}`); setMessage("");
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      const payload = (await response.json()) as { user?: UserRow; error?: string };
      if (!response.ok || !payload.user) throw new Error(payload.error ?? "Не удалось изменить доступ");
      setUsers((list) => list.map((user) => user.id === userId ? payload.user! : user));
      setMessage("Изменения сохранены.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Не удалось изменить доступ"); }
    finally { setBusy(null); }
  }

  return (
    <div className="site-shell admin-page">
      <SiteHeader {...header} />
      <main className="admin-main section">
        <div className="admin-heading"><div><p className="eyebrow">Управление курсом</p><h1 className="display-title">Заявки и доступ</h1></div><div className="admin-stat"><strong>{users.length}</strong><span>пользователей</span></div></div>
        <div className="admin-table-card">
          <Table className="admin-table">
            <TableHeader><TableRow><TableHead>Участник</TableHead><TableHead>Контакты</TableHead><TableHead>Тариф</TableHead><TableHead>Оплата</TableHead><TableHead>Доступ</TableHead><TableHead>Действия</TableHead></TableRow></TableHeader>
            <TableBody>
              {users.map((user) => {
                const accessIsActive = hasActiveAccess(user);
                return <TableRow key={user.id}>
                  <TableCell data-label="Участник"><strong>{user.name || "Без имени"}</strong><small>{user.email}</small></TableCell>
                  <TableCell data-label="Контакты">{user.phone || "Не указан"}</TableCell>
                  <TableCell data-label="Тариф">{planById(user.selectedPlan)?.name ?? "Не выбран"}</TableCell>
                  <TableCell data-label="Оплата"><span className={`status-pill status-${user.paymentStatus}`}>{labels[user.paymentStatus] ?? user.paymentStatus}</span></TableCell>
                  <TableCell data-label="Доступ"><span className={accessIsActive ? "access-yes" : "access-no"}>{accessIsActive ? "Открыт" : user.accessGranted ? "Истёк" : "Закрыт"}</span></TableCell>
                  <TableCell data-label="Действия"><div className="admin-actions">
                    {user.paymentStatus === "pending" ? <><button title="Подтвердить оплату" aria-label={`Подтвердить оплату для ${user.email}`} disabled={busy !== null} onClick={() => void act(user.id, "approve")}><CheckCircle2 /></button><button title="Отклонить оплату" aria-label={`Отклонить оплату для ${user.email}`} disabled={busy !== null} onClick={() => void act(user.id, "reject")}><XCircle /></button></> : null}
                    {accessIsActive ? <button title="Отозвать доступ" aria-label={`Отозвать доступ у ${user.email}`} disabled={busy !== null} onClick={() => void act(user.id, "revoke")}><ShieldOff /></button> : <button title="Выдать доступ" aria-label={`Выдать доступ ${user.email}`} disabled={busy !== null} onClick={() => void act(user.id, "grant")}><Shield /></button>}
                  </div></TableCell>
                </TableRow>;
              })}
            </TableBody>
          </Table>
          {!users.length ? <p className="admin-empty">Пользователи появятся после первого входа.</p> : null}
        </div>
        {message ? <p className="form-message" role="status">{message}</p> : null}
      </main>
      <SiteFooter />
    </div>
  );
}
