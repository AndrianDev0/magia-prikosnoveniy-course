"use client";

import Link from "next/link";
import { useState } from "react";
import { ArtworkMenu } from "@/components/course/artwork-menu";
import { SiteHeader } from "@/components/course/site-header";
import { bonusLesson, courseLessons, siteConfig } from "@/config/site";

type Header = Parameters<typeof SiteHeader>[0];

export function CoursePageClient({ header }: { header: Header }) {
  const [notice, setNotice] = useState("");
  const accountPath = header.user ? "/profile" : header.signInPath;
  const videoItems = [...courseLessons, bonusLesson];

  function showVideoPlaceholder(title: string) {
    setNotice(`«${title}»: видео будет добавлено позже`);
    window.setTimeout(() => setNotice(""), 2800);
  }

  return (
    <div className="figma-artwork-shell">
      {notice ? <div className="site-placeholder-toast" role="status">{notice}</div> : null}
      <main className="figma-artwork-page figma-lessons-artwork">
        <picture className="figma-artwork-picture">
          <source media="(max-width: 600px)" srcSet="/course/lessons-mobile-figma.png" width="1140" height="9321" />
          <img className="figma-artwork-image" src="/course/lessons-desktop-figma.png" alt="" aria-hidden="true" width="1920" height="12334" fetchPriority="high" />
        </picture>
        {[4, 5, 6].map((lessonIndex) => <div className={`lesson-title-copy lesson-title-copy-${lessonIndex + 1}`} aria-hidden="true" key={courseLessons[lessonIndex].slug}><span>{lessonIndex + 1} урок - {courseLessons[lessonIndex].title}</span></div>)}
        <div className="lesson-title-copy bonus-title-copy" aria-hidden="true"><span>{bonusLesson.title}</span></div>
        {[0, 1, 3, 4, 5, 6].map((lessonIndex) => {
          const lesson = courseLessons[lessonIndex];
          const ordinal = lessonIndex === 0 ? "первого" : lessonIndex === 1 ? "второго" : lessonIndex === 3 ? "четвёртого" : lessonIndex === 4 ? "пятого" : lessonIndex === 5 ? "шестого" : "седьмого";
          return <section className={`lesson-description-copy lesson-description-copy-${lessonIndex + 1}`} aria-label={`Описание ${ordinal} урока`} key={lesson.slug}><p>{lesson.description}</p></section>;
        })}
        <section className="lesson-description-copy bonus-description-copy" aria-label="Описание полной версии массажа"><p>{bonusLesson.description}</p></section>
        <div className="lesson-video-placeholders" aria-label="Видео курса">
          {videoItems.map((lesson, index) => (
            <button className={`lesson-video-placeholder lesson-video-placeholder-${index + 1}`} type="button" onClick={() => showVideoPlaceholder(lesson.title)} aria-label={`Открыть видео: ${lesson.title}. Пока заглушка`} key={lesson.slug}>
              <span aria-hidden="true">▶</span>
            </button>
          ))}
        </div>
        <ArtworkMenu accountPath={accountPath} coursePath="/course" />
        <h1 className="sr-only">Курс по Тантрическому массажу</h1>
        <nav className="figma-hotspots" aria-label="Навигация страницы курса">
          <a className="figma-hotspot home-account" href={accountPath} target={header.user ? undefined : "_top"} aria-label={header.user ? "Личный кабинет" : "Войти"} />
          <Link className="figma-hotspot home-brand" href="/" aria-label="Магия прикосновений — на главную" />
          {siteConfig.socials.map((social, index) => <a className={`figma-hotspot lesson-social lesson-social-${index + 1}`} href={social.href} aria-label={social.label} key={social.label} />)}
          <a className="figma-hotspot lesson-document lesson-document-2" href={siteConfig.documents[1].href} aria-label={siteConfig.documents[1].label} />
        </nav>
        <section className="sr-only" aria-label="Уроки курса">
          {courseLessons.map((lesson, index) => <article id={lesson.slug} key={lesson.slug}><h2>{Number(lesson.number)} урок — {lesson.title}</h2>{![0, 1, 3, 4, 5, 6].includes(index) && <p>{lesson.description}</p>}</article>)}
          <article id={bonusLesson.slug}><h2>{bonusLesson.title}</h2></article>
        </section>
      </main>
    </div>
  );
}
