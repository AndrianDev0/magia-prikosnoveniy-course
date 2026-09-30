import Image from "next/image";
import { Play } from "lucide-react";
import { siteConfig } from "@/config/site";

type MediaPosterProps = {
  label?: string;
  compact?: boolean;
  videoUrl?: string;
  poster?: string;
  alt?: string;
  priority?: boolean;
};

export function MediaPoster({
  label = "Смотреть вводное видео",
  compact = false,
  videoUrl = siteConfig.media.introVideoUrl,
  poster = siteConfig.media.poster,
  alt = "Эмиль Баткуллин в пространстве для практики",
  priority = false,
}: MediaPosterProps) {
  const resolvedVideoUrl = videoUrl.trim();

  return (
    <div className={compact ? "media-poster compact" : "media-poster"}>
      {resolvedVideoUrl ? (
        <video
          src={resolvedVideoUrl}
          poster={poster}
          controls
          playsInline
          preload="none"
          aria-label={label}
          style={{ width: "100%", height: "100%", display: "block", objectFit: "cover" }}
        />
      ) : (
        <>
          <Image
            src={poster}
            alt={alt}
            width={1600}
            height={900}
            priority={priority}
            sizes={compact
              ? "(max-width: 760px) calc(100vw - 68px), (max-width: 1200px) 50vw, 560px"
              : "(max-width: 980px) calc(100vw - 36px), 58vw"}
          />
          <div className="media-shade" aria-hidden="true" />
          <div className="play-label">
            <span className="play-icon" aria-hidden="true"><Play fill="currentColor" /></span>
            <span>{label}</span>
          </div>
          <span className="demo-badge">Видео скоро появится</span>
        </>
      )}
    </div>
  );
}
