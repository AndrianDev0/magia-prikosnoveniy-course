"use client";

import Image from "next/image";
import { useState } from "react";
import { DocumentsModal } from "@/components/course/documents-modal";
import { PlanModal } from "@/components/course/plan-modal";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { plans, siteConfig, type PlanId } from "@/config/site";

type HomeClientProps = {
  user: { displayName: string } | null;
  signInPath: string;
  signOutPath: string;
  isAdmin: boolean;
  planPaths: Record<PlanId, string>;
};

export function HomeClient(props: HomeClientProps) {
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <div className="site-shell">
      <DocumentsModal />
      <PlanModal open={planOpen} onOpenChange={setPlanOpen} />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <SiteHeader {...props} />

      <main className="figma-main">
        <section className="figma-hero" id="about">
          <h1>Курс по Тантрическому<br />массажу</h1>
          <p className="figma-tagline">Больше чувствительности. Больше контакта.<br />Больше близости через прикосновение.</p>
          <div className="figma-video">
            <Image
              src={siteConfig.media.poster}
              alt="Эмиль Баткуллин представляет курс"
              width={1600}
              height={900}
              sizes="(max-width: 720px) calc(100vw - 40px), 84vw"
              priority
            />
            <span>Здесь будет видео</span>
          </div>
        </section>

        <section className="figma-intro">
          <p className="figma-intro-main"><strong>«Магия прикосновений»</strong> — это практический курс по Тантрическому массажу, который поможет вам тоньше чувствовать своё тело и тело партнёра.<br />Через прикосновение, внимание и присутствие практика раскрывает чувственность, помогает проживать больше доверия, безопасности и близости в отношениях.</p>
          <p className="figma-intro-side"><strong>В курсе вы освоите</strong> целостную последовательность массажа, а также узнаете, как подготовить пространство, руки, масло и атмосферу для практики.</p>
        </section>

        <section className="figma-prices" id="prices" aria-label="Тарифы курса">
          <span className="section-anchor" id="program" aria-hidden="true" />
          <div className="figma-price-grid">
            {plans.map((plan) => (
              <article className={`figma-price-card figma-price-${plan.id}`} key={plan.id}>
                <p className="figma-plan-eyebrow">{plan.id === "vip-plus" ? "Без ограничений" : plan.eyebrow}</p>
                <h2>{plan.name}</h2>
                <div className="figma-plan-rule" aria-hidden="true" />
                <ul>{plan.features.filter((feature) => !feature.startsWith("Доступ")).map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <p className="figma-plan-price">{plan.priceLabel.replace("₽", "руб.")}</p>
                <button className="figma-plan-link" type="button" onClick={() => setPlanOpen(true)}>План курса</button>
                <a className="figma-card-hit" href={props.planPaths[plan.id]} target={props.user ? undefined : "_top"} aria-label={`Оплатить тариф ${plan.name}`} />
              </article>
            ))}
          </div>
          <div className="figma-course-entry">
            <a href={props.user ? "/course" : props.signInPath} target={props.user ? undefined : "_top"}>Перейти к курсу *</a>
            <span>*доступен после покупки</span>
          </div>
        </section>

        <section className="figma-author" id="author">
          <div className="figma-author-portrait">
            <Image
              src={siteConfig.author.image}
              alt={`Автор курса ${siteConfig.author.name}`}
              width={1054}
              height={1406}
              sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 980px) 42vw, 470px"
            />
            <span className="figma-author-nameplate">{siteConfig.author.name}</span>
          </div>
          <div className="figma-author-copy">
            <p>{siteConfig.author.bio}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
