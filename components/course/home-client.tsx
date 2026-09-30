"use client";

import Image from "next/image";
import { Check, ChevronDown, Flower2, Hand, Heart, Sparkles } from "lucide-react";
import { DocumentsModal } from "@/components/course/documents-modal";
import { MediaPoster } from "@/components/course/media-poster";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { courseLessons, plans, siteConfig, type PlanId } from "@/config/site";

type HomeClientProps = {
  user: { displayName: string } | null;
  signInPath: string;
  signOutPath: string;
  isAdmin: boolean;
  planPaths: Record<PlanId, string>;
};

export function HomeClient(props: HomeClientProps) {
  return (
    <div className="site-shell">
      <DocumentsModal />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <SiteHeader {...props} />

      <main>
        <section className="hero section" id="about">
          <div className="hero-copy">
            <p className="eyebrow">Авторский онлайн-курс</p>
            <h1><span>Магия</span>прикосновений</h1>
            <p className="hero-subtitle">Больше чувствительности. Больше контакта. Больше близости через прикосновение.</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#prices">Выбрать тариф</a>
              <a className="text-link" href="#program">Посмотреть программу</a>
            </div>
          </div>
          <div className="hero-media">
            <MediaPoster videoUrl={siteConfig.media.introVideoUrl} poster={siteConfig.media.poster} priority />
          </div>
          <div className="scroll-cue" aria-hidden="true"><span>Узнать больше</span><ChevronDown /></div>
        </section>

        <section className="intro section surface-dark">
          <div className="section-heading narrow-heading">
            <p className="eyebrow">О курсе</p>
            <h2 className="display-title">Тонкая практика близости</h2>
          </div>
          <div className="intro-grid">
            <p><strong>«Магия прикосновений»</strong> — это практический курс по Тантрическому массажу, который поможет вам тоньше чувствовать своё тело и тело партнёра.</p>
            <p>Эта медитативная практика мягко раскроет вашу чувственность, чувствительность и природную сексуальность, а ощущение доверия и безопасности поможет выйти на новый уровень близости в отношениях.</p>
            <p>Вы освоите непрерывную последовательность движений в массаже, а также узнаете, как подготовить пространство и руки, выбрать масло и музыку для этой практики. Вы научитесь входить в состояние любящего служения своему партнёру и наслаждаться этим.</p>
          </div>
          <div className="benefit-row">
            <article><Hand aria-hidden="true" /><span>Чуткость</span><p>Развиваем внимание к телу и качеству контакта.</p></article>
            <article><Heart aria-hidden="true" /><span>Доверие</span><p>Создаём безопасное пространство для близости.</p></article>
            <article><Sparkles aria-hidden="true" /><span>Практика</span><p>Следуем ясной последовательности движений.</p></article>
          </div>
        </section>

        <section className="program section" id="program">
          <div className="program-frame" aria-hidden="true"><span /><span /><span /><span /></div>
          <div className="section-heading centered">
            <p className="eyebrow dark">Семь шагов</p>
            <h2 className="display-title dark">План курса</h2>
          </div>
          <div className="program-grid">
            {courseLessons.map((lesson) => (
              <article key={lesson.slug}>
                <span className="lesson-number">{lesson.number}</span>
                <h3>{lesson.title}</h3>
                <p>{lesson.short}</p>
              </article>
            ))}
          </div>
          <div className="program-action">
            <a className="button button-ink" href="#prices">Продолжить</a>
            <span className="decorative-line" aria-hidden="true" />
          </div>
        </section>

        <section className="author section" id="author">
          <div className="author-portrait">
            <div className="portrait-halo" aria-hidden="true" />
            <Image
              src={siteConfig.author.image}
              alt={`Автор курса ${siteConfig.author.name}`}
              width={1054}
              height={1406}
              sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 980px) 42vw, 470px"
            />
            <span className="author-nameplate">{siteConfig.author.name}</span>
          </div>
          <div className="author-copy">
            <p className="eyebrow">Автор курса</p>
            <h2 className="display-title">Проводник в телесную глубину</h2>
            <p>{siteConfig.author.bio}</p>
            <div className="author-note"><Flower2 aria-hidden="true" /><span>Более 10 лет практики и обучения</span></div>
          </div>
        </section>

        <section className="prices section" id="prices">
          <div className="section-heading centered">
            <p className="eyebrow">Выберите формат</p>
            <h2 className="display-title">Тарифы участия</h2>
            <p>Каждый тариф открывает полный курс после ручного подтверждения оплаты.</p>
          </div>
          <div className="price-grid">
            {plans.map((plan) => (
              <article className={plan.featured ? "price-card featured" : "price-card"} key={plan.id}>
                {plan.featured ? <span className="popular">Выбор участников</span> : null}
                <p className="plan-eyebrow">{plan.eyebrow}</p>
                <h3>{plan.name}</h3>
                <p className="price">{plan.priceLabel}</p>
                <ul>{plan.features.map((feature) => <li key={feature}><Check aria-hidden="true" />{feature}</li>)}</ul>
                <a className="button button-ink" href={props.planPaths[plan.id]} target={props.user ? undefined : "_top"}>Оплатить</a>
                <a className="plan-link" href={`/documents/offer?plan=${plan.id}`}>Условия тарифа</a>
              </article>
            ))}
          </div>
          <div className="course-entry">
            <a className="button button-outline" href="/course">Перейти к курсу</a>
            <span>Доступ появляется после подтверждения администратором</span>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
