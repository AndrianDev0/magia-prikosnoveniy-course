import { Clock3, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";

type Header = Parameters<typeof SiteHeader>[0];

export function AccessGate({ header, paymentStatus, expired }: { header: Header; paymentStatus: string; expired: boolean }) {
  const copy = expired
    ? { title: "Срок доступа завершён", text: "Напишите автору, чтобы продлить доступ к материалам." }
    : paymentStatus === "pending"
      ? { title: "Оплата проверяется", text: "Заявка уже у администратора. Уроки откроются сразу после ручного подтверждения." }
      : paymentStatus === "rejected"
        ? { title: "Заявка отклонена", text: "Проверьте реквизиты и свяжитесь с автором, затем отправьте новую заявку." }
        : { title: "Доступ пока закрыт", text: "Выберите тариф в личном кабинете и отправьте заявку после оплаты." };
  return (
    <div className="site-shell gate-page">
      <SiteHeader {...header} />
      <main className="gate-main section">
        <div className="gate-symbol" aria-hidden="true"><LockKeyhole /><Clock3 /></div>
        <p className="eyebrow">Страница курса</p>
        <h1 className="display-title">{copy.title}</h1>
        <p>{copy.text}</p>
        <div className="gate-actions"><Link className="button button-primary" href="/profile">Открыть личный кабинет</Link><Link className="button button-outline" href="/">Вернуться на главную</Link></div>
      </main>
      <SiteFooter />
    </div>
  );
}
