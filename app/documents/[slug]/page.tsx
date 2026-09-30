import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import { isAdminEmail } from "@/lib/authz";

const documents = {
  privacy: { title: "Политика обработки персональных данных", intro: "Как будут обрабатываться персональные данные участников курса." },
  consent: { title: "Согласие на обработку персональных данных", intro: "Условия предоставления согласия на обработку персональных данных." },
  "rules-18": { title: "Правила курса 18+", intro: "Возрастные ограничения и правила участия в онлайн-курсе." },
  refunds: { title: "Правила возврата денежных средств", intro: "Порядок и условия возврата денежных средств за доступ к курсу." },
  agreement: { title: "Пользовательское соглашение", intro: "Правила использования сайта и материалов онлайн-курса." },
  offer: { title: "Публичная оферта", intro: "Условия приобретения доступа к онлайн-курсу." },
} as const;

export const dynamic = "force-dynamic";
export function generateStaticParams() { return Object.keys(documents).map((slug) => ({ slug })); }

export default async function DocumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const document = documents[slug as keyof typeof documents];
  if (!document) notFound();
  const user = await getChatGPTUser();
  return (
    <div className="site-shell legal-page">
      <SiteHeader user={user ? { displayName: user.displayName } : null} signInPath={chatGPTSignInPath(`/documents/${slug}`)} signOutPath={chatGPTSignOutPath("/")} isAdmin={user ? isAdminEmail(user.email) : false} />
      <main className="legal-main section"><p className="eyebrow">Демонстрационный документ</p><h1 className="display-title">{document.title}</h1><p className="legal-lead">{document.intro}</p><div className="legal-notice"><strong>TODO: юридическая редакция</strong><p>Перед публикацией замените этот текст на документ, подготовленный для вашей юрисдикции, формата оплаты и способа обработки персональных данных.</p></div><section><h2>Общие положения</h2><p>Эта страница оставлена рабочей и кликабельной, чтобы структуру сайта можно было проверить уже сейчас. Демонстрационный текст не является юридической консультацией или офертой.</p></section><section><h2>Контакты</h2><p>Актуальные реквизиты исполнителя, адрес для обращений и сроки ответа будут добавлены владельцем курса перед запуском.</p></section><Link className="button button-outline" href="/">Вернуться на главную</Link></main>
      <SiteFooter />
    </div>
  );
}
