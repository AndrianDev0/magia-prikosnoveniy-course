"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Clock3, CreditCard, ShieldCheck, XCircle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { planById, plans, siteConfig, type PlanId } from "@/config/site";

type ProfileData = {
  id: string;
  email: string;
  name: string;
  phone: string;
  selectedPlan: string | null;
  paymentStatus: string;
  accessGranted: boolean;
  accessGrantedAt: string | null;
  accessExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  identity: { displayName: string; email: string };
  profile: ProfileData;
  requestedPlan: string | null;
  requestPayment: boolean;
  signInPath: string;
  signOutPath: string;
  isAdmin: boolean;
  accessExpired: boolean;
};

const statusCopy = {
  not_paid: { label: "Не оплачено", text: "Выберите тариф и отправьте заявку после оплаты.", icon: CreditCard },
  pending: { label: "Ожидает подтверждения", text: "Администратор проверит перевод и откроет доступ вручную.", icon: Clock3 },
  confirmed: { label: "Подтверждено", text: "Оплата подтверждена. Материалы курса доступны.", icon: BadgeCheck },
  rejected: { label: "Отклонено", text: "Заявка отклонена. Проверьте реквизиты и свяжитесь с автором.", icon: XCircle },
} as const;

export function ProfileClient({ identity, profile: initial, requestedPlan, requestPayment, accessExpired, ...header }: Props) {
  const validRequested = planById(requestedPlan)?.id;
  const initialPlan = (validRequested ?? planById(initial.selectedPlan)?.id ?? "standard") as PlanId;
  const [profile, setProfile] = useState(initial);
  const [name, setName] = useState(initial.name || identity.displayName);
  const [phone, setPhone] = useState(initial.phone);
  const [planId, setPlanId] = useState<PlanId>(initialPlan);
  const [payOpen, setPayOpen] = useState(requestPayment && Boolean(initial.name && initial.phone));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const plan = useMemo(() => planById(planId) ?? plans[0], [planId]);
  const state = statusCopy[profile.paymentStatus as keyof typeof statusCopy] ?? statusCopy.not_paid;
  const StatusIcon = state.icon;
  const hasCourseAccess = profile.accessGranted && !accessExpired;
  const paymentLocked = profile.paymentStatus === "pending" || (profile.paymentStatus === "confirmed" && hasCourseAccess);

  async function saveProfile(openPayment = false, manageBusy = true): Promise<ProfileData | null> {
    if (manageBusy) setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, selectedPlan: planId }),
      });
      const payload = (await response.json()) as { user?: ProfileData; error?: string };
      if (!response.ok || !payload.user) throw new Error(payload.error ?? "Не удалось сохранить профиль");
      setProfile(payload.user);
      setMessage("Контактные данные сохранены.");
      if (openPayment) setPayOpen(true);
      return payload.user;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить профиль");
      return null;
    } finally {
      if (manageBusy) setBusy(false);
    }
  }

  async function submitPayment() {
    if (!name.trim() || !phone.trim()) {
      setPayOpen(false);
      setMessage("Сначала заполните имя и телефон.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const saved = await saveProfile(false, false);
      if (!saved) return;
      const response = await fetch("/api/payment-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const payload = (await response.json()) as { status?: string; error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Не удалось отправить заявку");
      setProfile((value) => ({ ...value, paymentStatus: "pending", selectedPlan: planId, accessGranted: false }));
      setPayOpen(false);
      setMessage("Заявка отправлена. Доступ появится после подтверждения администратора.");
      return payload;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось отправить заявку");
      return;
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const context = (document as Document & { modelContext?: { registerTool?: (tool: unknown, options?: { signal?: AbortSignal }) => void | Promise<void> } }).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(context.registerTool({
      name: "select_course_tariff",
      title: "Выбрать тариф курса",
      description: "Выбирает тариф в видимой форме личного кабинета без отправки оплаты.",
      inputSchema: { type: "object", properties: { planId: { type: "string", enum: plans.map((item) => item.id) } }, required: ["planId"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input: unknown) {
        const value = (input as { planId?: string }).planId;
        const selected = planById(value);
        if (!selected) throw new Error("Неизвестный тариф");
        setPlanId(selected.id);
        return { planId: selected.id, plan: selected.name, amount: selected.price };
      },
    }, { signal: lifecycle.signal })).catch(() => undefined);
    return () => lifecycle.abort();
  }, []);

  return (
    <div className="site-shell account-page">
      <SiteHeader user={{ displayName: identity.displayName }} {...header} />
      <main className="account-main section">
        <div className="account-heading">
          <p className="eyebrow">Личный кабинет</p>
          <h1 className="display-title">Здравствуйте, {name || identity.displayName}</h1>
          <p>Здесь хранятся ваши контакты, тариф и состояние доступа к курсу.</p>
        </div>

        <div className="account-grid">
          <section className="account-card status-card" aria-labelledby="status-title">
            <div className={`status-icon status-${profile.paymentStatus}`}><StatusIcon aria-hidden="true" /></div>
            <div><span className="account-label">Статус оплаты</span><h2 id="status-title">{state.label}</h2><p>{state.text}</p></div>
            <div className="access-line"><ShieldCheck aria-hidden="true" /><span>Доступ к урокам: <strong>{hasCourseAccess ? "открыт" : accessExpired ? "истёк" : "закрыт"}</strong></span></div>
            {hasCourseAccess ? <a className="button button-primary" href="/course">Перейти к курсу</a> : <span className="button button-disabled" role="link" aria-disabled="true">Перейти к курсу</span>}
          </section>

          <section className="account-card profile-form" aria-labelledby="profile-title">
            <span className="account-label">Данные участника</span>
            <h2 id="profile-title">Контакты</h2>
            <div className="form-field"><Label htmlFor="name">Имя</Label><Input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></div>
            <div className="form-field"><Label htmlFor="phone">Телефон</Label><Input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+7 900 000-00-00" /></div>
            <div className="form-field"><Label htmlFor="email">Email</Label><Input id="email" value={identity.email} readOnly aria-describedby="email-note" /><small id="email-note">Получен из защищённой учётной записи.</small></div>
            <button className="button button-outline" type="button" disabled={busy} onClick={() => void saveProfile(false)}>Сохранить данные</button>
          </section>

          <section className="account-card tariff-picker" aria-labelledby="tariff-title">
            <span className="account-label">Шаг 2</span><h2 id="tariff-title">Выберите тариф</h2>
            <RadioGroup value={planId} onValueChange={(value) => setPlanId(value as PlanId)} aria-label="Тариф курса" disabled={paymentLocked}>
              {plans.map((item) => (
                <Label className={planId === item.id ? "tariff-option selected" : "tariff-option"} key={item.id} htmlFor={`plan-${item.id}`}>
                  <RadioGroupItem value={item.id} id={`plan-${item.id}`} />
                  <span><strong>{item.name}</strong><small>{item.eyebrow}</small></span>
                  <b>{item.priceLabel}</b>
                </Label>
              ))}
            </RadioGroup>
            {paymentLocked ? <p className="form-hint">Для активной или уже отправленной заявки смена тарифа доступна через администратора.</p> : null}
            <button className="button button-primary" type="button" disabled={busy || paymentLocked} onClick={() => void saveProfile(true)}>Сохранить и перейти к оплате</button>
          </section>
        </div>
        {message ? <p className="form-message" role="status" aria-live="polite">{message}</p> : null}
      </main>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="payment-dialog">
          <DialogHeader><span className="dialog-kicker">Демонстрационная оплата</span><DialogTitle className="display-title">{plan.name}</DialogTitle><DialogDescription>Проверьте сумму и отсканируйте QR-код. Реальные реквизиты будут добавлены перед публикацией.</DialogDescription></DialogHeader>
          <div className="payment-layout">
            <Image src={siteConfig.payment.qrImage} alt="Демонстрационный QR-код — не оплачивать" width={480} height={480} sizes="(max-width: 600px) 78vw, 280px" />
            <div><span>Сумма</span><strong>{plan.priceLabel}</strong><dl><div><dt>Получатель</dt><dd>{siteConfig.payment.recipient}</dd></div><div><dt>Назначение</dt><dd>{siteConfig.payment.purpose}</dd></div></dl></div>
          </div>
          <p className="demo-warning">Это демонстрационный экран. Не отправляйте деньги по этим данным.</p>
          <button className="button button-primary" type="button" disabled={busy} onClick={() => void submitPayment()}>Я оплатил</button>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
