"use client";

import Image from "next/image";
import { SiteFooter } from "@/components/course/site-footer";
import { SiteHeader } from "@/components/course/site-header";
import { bonusLesson, courseLessons } from "@/config/site";

type Header = Parameters<typeof SiteHeader>[0];

type LessonMediaProps = {
  alt: string;
  poster: string;
  videoUrl: string;
  priority?: boolean;
};

function LessonMedia({ alt, poster, videoUrl, priority = false }: LessonMediaProps) {
  const resolvedVideoUrl = videoUrl.trim();

  return (
    <div className="figma-course-media">
      {resolvedVideoUrl ? (
        <video
          aria-label={alt}
          controls
          playsInline
          poster={poster}
          preload="none"
          src={resolvedVideoUrl}
        />
      ) : (
        <Image
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 720px) calc(100vw - 32px), 86vw"
          src={poster}
        />
      )}
    </div>
  );
}

export function CoursePageClient({ header }: { header: Header }) {
  return (
    <div className="site-shell course-page figma-course-page">
      <SiteHeader {...header} />

      <main className="figma-course-main">
        <header className="figma-course-heading">
          <h1>Курс по Тантрическому<br />массажу</h1>
          <p>Больше чувствительности. Больше контакта.<br />Больше близости через прикосновение.</p>
        </header>

        <section className="figma-course-lessons" aria-label="Уроки курса">
          {courseLessons.map((lesson, index) => (
            <article
              className="figma-course-lesson"
              id={lesson.slug}
              key={lesson.slug}
              style={{ "--lesson-index": index } as React.CSSProperties}
            >
              <h2>{Number(lesson.number)} урок - {lesson.title.toLocaleLowerCase("ru")}</h2>
              <LessonMedia
                alt={`Обложка видеоурока «${lesson.title}»`}
                poster={lesson.poster}
                priority={index === 0}
                videoUrl={lesson.videoUrl}
              />
              <p>{lesson.description}</p>
            </article>
          ))}

          <article className="figma-course-lesson figma-course-bonus" id={bonusLesson.slug}>
            <h2>Дополнительно</h2>
            <LessonMedia
              alt={`Обложка видео «${bonusLesson.title}»`}
              poster={bonusLesson.poster}
              videoUrl={bonusLesson.videoUrl}
            />
            <p><strong>Полное видео массажа</strong> — {bonusLesson.description}</p>
          </article>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
