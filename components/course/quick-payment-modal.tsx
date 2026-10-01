"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { planById, plans, type PlanId } from "@/config/site";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; planId: PlanId };

export function QuickPaymentModal({ open, onOpenChange, planId }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const plan = useMemo(() => planById(planId) ?? plans[0], [planId]);

  useEffect(() => { if (open) { setError(""); setSent(false); } }, [open, planId]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payment-lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, phone, planId }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Не удалось отправить заявку");
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не удалось отправить заявку");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="payment-dialog quick-payment-dialog">
        {sent ? (
          <div className="payment-success" role="status">
            <CheckCircle2 aria-hidden="true" />
            <DialogTitle className="display-title">Заявка отправлена</DialogTitle>
            <DialogDescription>Контакты уже появились в админ-панели. После проверки оплаты администратор откроет доступ к курсу.</DialogDescription>
            <button className="button button-primary" type="button" onClick={() => onOpenChange(false)}>Готово</button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <span className="dialog-kicker">Оплата курса</span>
              <DialogTitle className="display-title">{plan.name} · {plan.priceLabel}</DialogTitle>
              <DialogDescription>Заполните контакты, оплатите по QR и отправьте заявку администратору.</DialogDescription>
            </DialogHeader>
            <div className="quick-payment-layout">
              <div className="quick-payment-qr">
                <Image src="/course/payment-qr-placeholder.svg" alt="Место для QR-кода оплаты" width={480} height={480} priority />
                <strong>QR-код оплаты</strong>
                <span>Заглушка — заменим на рабочий QR позже</span>
              </div>
              <form className="quick-payment-form" onSubmit={submit}>
                <div className="form-field"><Label htmlFor="payment-name">Имя</Label><Input id="payment-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" placeholder="Как к вам обращаться" required minLength={2} /></div>
                <div className="form-field"><Label htmlFor="payment-email">Почта</Label><Input id="payment-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" placeholder="name@example.com" required /></div>
                <div className="form-field"><Label htmlFor="payment-phone">Телефон</Label><Input id="payment-phone" value={phone} onChange={(event) => setPhone(event.target.value)} autoComplete="tel" inputMode="tel" placeholder="+7 900 000-00-00" required /></div>
                {error ? <p className="payment-error" role="alert">{error}</p> : null}
                <button className="button button-primary" type="submit" disabled={busy}>{busy ? "Отправляем…" : "Я оплатил — отправить заявку"}</button>
                <p className="form-hint">Нажимая кнопку, вы отправляете контакты администратору для проверки платежа.</p>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
