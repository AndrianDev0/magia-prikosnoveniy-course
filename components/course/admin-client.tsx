"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { planById } from "@/config/site";
import { isAccessExpired } from "@/lib/access";

type Header = Parameters<typeof SiteHeader>[0];
type UserRow = {
  id: string; email: string; name: string; phone: string; selectedPlan: string | null;
  paymentStatus: string; accessGranted: boolean; accessGrantedAt: string | null;
  accessExpiresAt: string | null; createdAt: string; updatedAt: string;
};
type Action = "approve" | "reject" | "grant" | "revoke";
type Filter = "applications" | "pending" | "confirmed" | "rejected" | "accounts";

const paymentLabels: Record<string, string> = {
  not_paid: "Без заявки", pending: "Ждёт проверки", confirmed: "Оплата подтверждена", rejected: "Отклонена",
};
const actionLabels: Record<Action, string> = {
  approve: "Подтвердить оплату", reject: "Отклонить заявку", grant: "Выдать доступ", revoke: "Закрыть доступ",
};
const filters: { id: Filter; label: string }[] = [
  { id: "applications", label: "Все заявки" }, { id: "pending", label: "На проверке" },
  { id: "confirmed", label: "Подтверждены" }, { id: "rejected", label: "Отклонены" },
  { id: "accounts", label: "Без заявки" },
];
const dateFormat = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" });
const priceFormat = new Intl.NumberFormat("ru-RU");
const hasActiveAccess = (user: UserRow) => user.accessGranted && !isAccessExpired(user.accessExpiresAt);
const formattedDate = (value: string | null) => value && !Number.isNaN(Date.parse(value)) ? dateFormat.format(new Date(value)) : "Дата не указана";
const planSummary = (id: string | null) => {
  const plan = planById(id);
  return plan ? `${plan.name} · ${priceFormat.format(plan.price)} ₽` : "Тариф не выбран";
};

export function AdminClient({ header, initialUsers, initialLoadError = "" }: { header: Header; initialUsers: UserRow[]; initialLoadError?: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [filter, setFilter] = useState<Filter>("pending");
  const [query, setQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState(initialLoadError);
  const [notice, setNotice] = useState("");
  const [confirmation, setConfirmation] = useState<{ user: UserRow; action: Action } | null>(null);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (confirmation && !dialog.open) dialog.showModal();
    if (!confirmation && dialog.open) dialog.close();
  }, [confirmation]);

  const counts = useMemo(() => ({
    applications: users.filter((user) => user.paymentStatus !== "not_paid").length,
    pending: users.filter((user) => user.paymentStatus === "pending").length,
    confirmed: users.filter((user) => user.paymentStatus === "confirmed").length,
    rejected: users.filter((user) => user.paymentStatus === "rejected").length,
    accounts: users.filter((user) => user.paymentStatus === "not_paid").length,
    access: users.filter(hasActiveAccess).length,
  }), [users]);
  const visibleUsers = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("ru-RU");
    return users.filter((user) => {
      const statusMatches = filter === "applications" ? user.paymentStatus !== "not_paid" :
        filter === "accounts" ? user.paymentStatus === "not_paid" : user.paymentStatus === filter;
      return statusMatches && (!needle || [user.name, user.email, user.phone].some((value) => value.toLocaleLowerCase("ru-RU").includes(needle)));
    }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  }, [users, filter, query]);

  async function refresh() {
    setRefreshing(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      const payload = (await response.json()) as { users?: UserRow[]; error?: string };
      if (!response.ok || !Array.isArray(payload.users)) throw new Error(payload.error ?? "Не удалось обновить список заявок.");
      setUsers(payload.users);
      setNotice("Список обновлён.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось обновить список заявок.");
    } finally { setRefreshing(false); }
  }

  async function act(userId: string, action: Action) {
    setBusyId(userId); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/users/${encodeURIComponent(userId)}`, {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
      });
      const payload = (await response.json()) as { user?: UserRow; error?: string };
      if (!response.ok || !payload.user) throw new Error(payload.error ?? "Не удалось сохранить изменение.");
      setUsers((list) => list.map((user) => user.id === userId ? payload.user! : user));
      setNotice(`${actionLabels[action]}. Изменение сохранено.`);
      setConfirmation(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось сохранить изменение.");
    } finally { setBusyId(null); }
  }

  function requestAction(user: UserRow, action: Action) {
    setError(""); setNotice(""); setPaymentChecked(false);
    setConfirmation({ user, action });
  }

  return (
    <div className="site-shell admin-page">
      <SiteHeader {...header} />
      <main className="admin-main section">
        <div className="admin-heading">
          <div><p className="eyebrow">Управление курсом</p><h1 className="display-title">Заявки и доступ</h1><p className="admin-intro">Контакты покупателей, выбранные тарифы и решения по доступу в одном месте.</p></div>
          <button className="admin-refresh" type="button" onClick={() => void refresh()} disabled={refreshing || busyId !== null}>{refreshing ? "Обновляем…" : "Обновить список"}</button>
        </div>

        <div className="admin-overview" aria-label="Сводка по заявкам">
          <div><span>Нужна проверка</span><strong>{counts.pending}</strong></div>
          <div><span>Всего заявок</span><strong>{counts.applications}</strong></div>
          <div><span>Доступ открыт</span><strong>{counts.access}</strong></div>
        </div>
        <p className="admin-payment-note">Статус оплаты меняется вручную. Подтверждайте заявку только после проверки поступления денег вне сайта.</p>

        <div className="admin-toolbar">
          <div className="admin-filters" aria-label="Фильтр заявок">
            {filters.map((item) => <button key={item.id} type="button" aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}<span>{counts[item.id]}</span></button>)}
          </div>
          <label className="admin-search"><span>Поиск по имени, почте или телефону</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти заявку" autoComplete="off" /></label>
        </div>

        {error ? <p className="admin-feedback admin-feedback-error" role="alert">{error}</p> : null}
        {notice ? <p className="admin-feedback" role="status">{notice}</p> : null}
        <p className="admin-result-count" role="status">Показано: {visibleUsers.length}</p>

        <div className="admin-lead-list" aria-busy={refreshing}>
          {visibleUsers.map((user) => {
            const active = hasActiveAccess(user);
            const plan = planById(user.selectedPlan);
            const phone = user.phone.replace(/[^\d+]/g, "");
            return <article className="admin-lead" key={user.id}>
              <div className="admin-lead-person"><h2>{user.name || "Имя не указано"}</h2><a href={`mailto:${encodeURIComponent(user.email)}`}>{user.email}</a>{user.phone ? /^\+?\d{7,16}$/.test(phone) ? <a href={`tel:${phone}`}>{user.phone}</a> : <span>{user.phone}</span> : <span>Телефон не указан</span>}</div>
              <div className="admin-lead-order"><span className="admin-detail-label">Тариф и дата</span><strong>{plan?.name ?? "Тариф не выбран"}</strong><time dateTime={user.createdAt}>{formattedDate(user.createdAt)}</time></div>
              <div className="admin-lead-state"><span className={`status-pill status-${user.paymentStatus}`}>{paymentLabels[user.paymentStatus] ?? "Статус неизвестен"}</span><span className={active ? "access-yes" : "access-no"}>{active ? "Доступ открыт" : user.accessGranted ? "Доступ истёк" : "Доступ закрыт"}</span>{active && user.accessExpiresAt ? <small>До {formattedDate(user.accessExpiresAt)}</small> : null}</div>
              <div className="admin-lead-actions" aria-label={`Действия для ${user.email}`}>
                {user.paymentStatus === "pending" ? <><button type="button" disabled={busyId !== null} onClick={() => requestAction(user, "approve")}>Подтвердить оплату</button><button type="button" className="admin-action-secondary" disabled={busyId !== null} onClick={() => requestAction(user, "reject")}>Отклонить</button></> : null}
                {active ? <button type="button" className="admin-action-secondary" disabled={busyId !== null} onClick={() => requestAction(user, "revoke")}>Закрыть доступ</button> : <button type="button" className="admin-action-secondary" disabled={busyId !== null} onClick={() => requestAction(user, "grant")}>Выдать доступ вручную</button>}
              </div>
            </article>;
          })}
          {!visibleUsers.length ? <div className="admin-empty"><h2>{users.length ? "Здесь пока нет заявок" : "Заявок пока нет"}</h2><p>{users.length ? "Измените фильтр или поисковый запрос." : error ? "Проверьте подключение и нажмите «Обновить список»." : "Когда покупатель отправит заявку, она появится здесь."}</p>{users.length ? <button type="button" onClick={() => { setFilter("applications"); setQuery(""); }}>Показать все заявки</button> : null}</div> : null}
        </div>
      </main>
      <SiteFooter />

      <dialog className="admin-confirm" ref={dialogRef} aria-labelledby="admin-confirm-title" onCancel={(event) => { event.preventDefault(); setConfirmation(null); }}>
        {confirmation ? <div className="admin-confirm-content"><p className="eyebrow">Проверка действия</p><h2 id="admin-confirm-title">{actionLabels[confirmation.action]}</h2><p><strong>{confirmation.user.name || confirmation.user.email}</strong><br />{confirmation.user.email}<br />{planSummary(confirmation.user.selectedPlan)}</p>
          {confirmation.action === "approve" || confirmation.action === "grant" ? <label className="admin-confirm-check"><input type="checkbox" checked={paymentChecked} onChange={(event) => setPaymentChecked(event.target.checked)} /><span>{confirmation.action === "approve" ? "Я проверил поступление оплаты вне сайта. После подтверждения участнику откроется курс." : "Я понимаю, что открою курс вручную, даже если оплата не подтверждена."}</span></label> : <p className="admin-confirm-note">Изменение доступа вступит в силу сразу после сохранения.</p>}
          {error ? <p className="admin-dialog-error" role="alert">{error}</p> : null}
          <div className="admin-confirm-actions"><button type="button" className="admin-action-secondary" onClick={() => setConfirmation(null)} disabled={busyId !== null}>Отмена</button><button type="button" disabled={busyId !== null || ((confirmation.action === "approve" || confirmation.action === "grant") && !paymentChecked)} onClick={() => void act(confirmation.user.id, confirmation.action)}>{busyId ? "Сохраняем…" : actionLabels[confirmation.action]}</button></div>
        </div> : null}
      </dialog>
    </div>
  );
}
