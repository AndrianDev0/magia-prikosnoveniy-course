"use client";

import Image from "next/image";
import { useState } from "react";
import { BookOpen, CircleCheck, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaPoster } from "@/components/course/media-poster";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { bonusLesson, courseLessons, siteConfig } from "@/config/site";

type Header = Parameters<typeof SiteHeader>[0];

export function CoursePageClient({ header }: { header: Header }) {
  const [planOpen, setPlanOpen] = useState(false);
  return (
    <div className="site-shell course-page">
      <div className="ambient ambient-one" aria-hidden="true" />
      <SiteHeader {...header} />
      <main>
        <section className="course-hero section">
          <div>
            <p className="eyebrow">Добро пожаловать</p>
            <h1 className="display-title">Курс по тантрическому массажу</h1>
            <p>Больше чувствительности. Больше контакта. Больше близости через прикосновение.</p>
            <button className="button button-outline" type="button" onClick={() => setPlanOpen(true)}><BookOpen aria-hidden="true" />План курса</button>
          </div>
          <MediaPoster
            label="Вводное видео"
            videoUrl={siteConfig.media.introVideoUrl}
            poster={siteConfig.media.poster}
            priority
          />
        </section>

        <section className="course-author section">
          <Image
            src={siteConfig.author.image}
            alt={siteConfig.author.name}
            width={1054}
            height={1406}
            sizes="(max-width: 760px) 250px, 260px"
          />
          <div><p className="eyebrow">Автор курса</p><h2 className="display-title">{siteConfig.author.name}</h2><p>{siteConfig.author.bio}</p></div>
        </section>

        <section className="lessons section" aria-labelledby="lessons-title">
          <div className="section-heading centered"><p className="eyebrow">Практика шаг за шагом</p><h2 className="display-title" id="lessons-title">Уроки курса</h2></div>
          <div className="lesson-card-grid">
            {courseLessons.map((lesson) => (
              <article className="lesson-card" key={lesson.slug} id={lesson.slug}>
                <header><span>{lesson.number}</span><h3>{lesson.title}</h3></header>
                <MediaPoster
                  compact
                  label={`Урок ${Number(lesson.number)}`}
                  videoUrl={lesson.videoUrl}
                  poster={lesson.poster}
                  alt={`Обложка видеоурока «${lesson.title}»`}
                />
                <p>{lesson.description}</p>
                <div className="lesson-state"><CircleCheck aria-hidden="true" />Материал доступен</div>
              </article>
            ))}
            <article className="lesson-card bonus-card" id={bonusLesson.slug}>
              <header><span>{bonusLesson.number}</span><h3>Дополнительно: {bonusLesson.title}</h3></header>
              <MediaPoster
                compact
                label="Полная практика"
                videoUrl={bonusLesson.videoUrl}
                poster={bonusLesson.poster}
                alt={`Обложка видео «${bonusLesson.title}»`}
              />
              <p>{bonusLesson.description}</p>
              <div className="lesson-state"><Sparkles aria-hidden="true" />Бонусный материал</div>
            </article>
          </div>
        </section>
      </main>

      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="plan-dialog">
          <DialogHeader><span className="dialog-kicker">Содержание</span><DialogTitle className="display-title">План курса</DialogTitle><DialogDescription>Семь последовательных уроков и полная практика без остановок.</DialogDescription></DialogHeader>
          <ol className="plan-list">{courseLessons.map((lesson) => <li key={lesson.slug}><span>{lesson.number}</span><div><strong>{lesson.title}</strong><p>{lesson.short}</p></div></li>)}</ol>
          <a className="button button-primary" href="#lessons-title" onClick={() => setPlanOpen(false)}>Перейти к урокам</a>
        </DialogContent>
      </Dialog>
      <SiteFooter />
    </div>
  );
}
