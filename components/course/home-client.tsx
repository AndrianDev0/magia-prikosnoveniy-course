"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useRef, useState } from "react";
import { DocumentsModal } from "@/components/course/documents-modal";
import { PlanModal } from "@/components/course/plan-modal";
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
  const [mobilePlanIndex, setMobilePlanIndex] = useState(1);
  const mobileTouchStart = useRef<number | null>(null);
  const accountPath = props.user ? "/profile" : props.signInPath;

  function selectMobilePlan(index: number) {
    setMobilePlanIndex(Math.max(0, Math.min(plans.length - 1, index)));
  }

  return (
    <div className="figma-artwork-shell">
      <DocumentsModal />
      <PlanModal open={planOpen} onOpenChange={setPlanOpen} />

      <main className="figma-artwork-page figma-home-artwork">
        <picture className="figma-artwork-picture">
          <source media="(max-width: 600px)" srcSet="/course/home-mobile-figma.png" width="1140" height="5418" />
          <img className="figma-artwork-image" src="/course/home-desktop.svg" alt="" aria-hidden="true" width="1920" height="5657" fetchPriority="high" />
        </picture>

        <div className="figma-ambient-glows" aria-hidden="true">
          <span className="figma-ambient-glow figma-ambient-glow-1" />
          <span className="figma-ambient-glow figma-ambient-glow-2" />
          <span className="figma-ambient-glow figma-ambient-glow-3" />
          <span className="figma-ambient-glow figma-ambient-glow-4" />
        </div>

        <section
          className="mobile-plan-carousel"
          data-index={mobilePlanIndex}
          aria-label="Выбор тарифа"
          onTouchStart={(event) => { mobileTouchStart.current = event.touches[0]?.clientX ?? null; }}
          onTouchEnd={(event) => {
            const start = mobileTouchStart.current;
            const end = event.changedTouches[0]?.clientX;
            mobileTouchStart.current = null;
            if (start === null || end === undefined || Math.abs(end - start) < 35) return;
            selectMobilePlan(mobilePlanIndex + (end < start ? 1 : -1));
          }}
        >
          <div className="mobile-plan-controls">
            <button type="button" onClick={() => selectMobilePlan(mobilePlanIndex - 1)} disabled={mobilePlanIndex === 0} aria-label="Предыдущий тариф">←</button>
            <div className="mobile-plan-dots" aria-label="Тарифы">
              {plans.map((plan, index) => (
                <button
                  type="button"
                  className={index === mobilePlanIndex ? "is-active" : undefined}
                  onClick={() => selectMobilePlan(index)}
                  aria-label={`Показать тариф ${plan.name}`}
                  aria-current={index === mobilePlanIndex ? "true" : undefined}
                  key={plan.id}
                />
              ))}
            </div>
            <button type="button" onClick={() => selectMobilePlan(mobilePlanIndex + 1)} disabled={mobilePlanIndex === plans.length - 1} aria-label="Следующий тариф">→</button>
          </div>
          <div className="mobile-plan-viewport">
            <div className="mobile-plan-track">
              {plans.map((plan, index) => (
                <article className={`mobile-plan-slide ${index === mobilePlanIndex ? "is-active" : "is-side"}`} key={plan.id}>
                  <a href={props.planPaths[plan.id]} target={props.user ? undefined : "_top"} aria-label={`Оплатить тариф ${plan.name}`}>
                    <Image src={`/course/plan-${plan.id}.png`} alt={`Тариф ${plan.name}: ${plan.priceLabel}`} width={536} height={index === 0 ? 682 : index === 1 ? 862 : 1070} />
                  </a>
                  <button type="button" onClick={() => setPlanOpen(true)}>План курса</button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <h1 className="sr-only">Курс по Тантрическому массажу</h1>
        <nav className="figma-hotspots" aria-label="Навигация по странице">
          <a className="figma-hotspot home-account" href={accountPath} target={props.user ? undefined : "_top"} aria-label={props.user ? "Личный кабинет" : "Войти"} />
          <Link className="figma-hotspot home-brand" href="/" aria-label="Магия прикосновений — на главную" />
          {plans.map((plan, index) => (
            <Fragment key={plan.id}>
              <a className={`figma-hotspot home-plan-card home-plan-card-${index + 1}`} href={props.planPaths[plan.id]} target={props.user ? undefined : "_top"} aria-label={`Оплатить тариф ${plan.name}`} />
              <button className={`figma-hotspot home-plan-details home-plan-details-${index + 1}`} type="button" onClick={() => setPlanOpen(true)} aria-label={`Показать план курса для тарифа ${plan.name}`} />
            </Fragment>
          ))}
          <a className="figma-hotspot home-course-entry" href={props.user ? "/course" : props.signInPath} target={props.user ? undefined : "_top"} aria-label="Перейти к курсу" />
          {siteConfig.socials.map((social, index) => <a className={`figma-hotspot home-social home-social-${index + 1}`} href={social.href} aria-label={social.label} key={social.label} />)}
          <a className="figma-hotspot home-document home-document-2" href={siteConfig.documents[1].href} aria-label={siteConfig.documents[1].label} />
        </nav>
        <section className="sr-only" aria-label="Описание курса"><p>{siteConfig.description}</p><p>{siteConfig.author.bio}</p></section>
        <section className="sr-only" aria-label="Тарифы курса">
          {plans.map((plan) => <article key={plan.id}><h2>{plan.name} — {plan.priceLabel}</h2><p>{plan.eyebrow}</p><ul>{plan.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></article>)}
        </section>
      </main>
    </div>
  );
}
