"use client";

import Link from "next/link";
import { SiteHeader } from "@/components/course/site-header";
import { bonusLesson, courseLessons, siteConfig } from "@/config/site";

type Header = Parameters<typeof SiteHeader>[0];

export function CoursePageClient({ header }: { header: Header }) {
  const accountPath = header.user ? "/profile" : header.signInPath;
  return (
    <div className="figma-artwork-shell">
      <main className="figma-artwork-page figma-lessons-artwork">
        <picture className="figma-artwork-picture">
          <source media="(max-width: 600px)" srcSet="/course/lessons-mobile.svg" width="380" height="3107" />
          <img className="figma-artwork-image" src="/course/lessons-desktop.svg" alt="" aria-hidden="true" width="1920" height="12334" fetchPriority="high" />
        </picture>
        <h1 className="sr-only">Курс по Тантрическому массажу</h1>
        <nav className="figma-hotspots" aria-label="Навигация страницы курса">
          <Link className="figma-hotspot home-brand" href="/" aria-label="Магия прикосновений — на главную" />
          <a className="figma-hotspot home-account" href={accountPath} target={header.user ? undefined : "_top"} aria-label={header.user ? "Личный кабинет" : "Войти"} />
          {siteConfig.socials.map((social, index) => <a className={`figma-hotspot lesson-social lesson-social-${index + 1}`} href={social.href} aria-label={social.label} key={social.label} />)}
          <a className="figma-hotspot lesson-document lesson-document-2" href={siteConfig.documents[1].href} aria-label={siteConfig.documents[1].label} />
        </nav>
        <section className="sr-only" aria-label="Уроки курса">
          {courseLessons.map((lesson) => <article id={lesson.slug} key={lesson.slug}><h2>{Number(lesson.number)} урок — {lesson.title}</h2><p>{lesson.description}</p></article>)}
          <article id={bonusLesson.slug}><h2>{bonusLesson.title}</h2><p>{bonusLesson.description}</p></article>
        </section>
      </main>
    </div>
  );
}
