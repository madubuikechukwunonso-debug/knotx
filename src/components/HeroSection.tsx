"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const videos = useMemo(
    () => [
      "/videos/1.webm",
      "/videos/2.webm",
      "/videos/3.webm",
      "/videos/4.webm",
    ],
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const tryPlayVideos = async () => {
      for (const video of videoRefs.current) {
        if (!video) continue;

        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;

        try {
          await video.play();
        } catch {
          // Mobile browsers may delay autoplay until the video is ready.
        }
      }
    };

    tryPlayVideos();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        tryPlayVideos();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [mounted]);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
      <div
        className={`absolute inset-0 grid grid-cols-2 grid-rows-2 transition-opacity duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {videos.map((src, index) => (
          <div
            key={src}
            className="relative h-full w-full overflow-hidden bg-neutral-900"
          >
            <video
              ref={(el) => {
                videoRefs.current[index] = el;
              }}
              className="h-full w-full scale-[1.03] object-cover"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/images/hero/hero-1.jpg"
              controls={false}
              onCanPlay={(e) => {
                const video = e.currentTarget;
                video.muted = true;
                video.defaultMuted = true;
                video
                  .play()
                  .catch(() => {});
              }}
            >
              <source src={src} type="video/webm" />
            </video>

            <div className="absolute inset-0 bg-black/20" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.38) 100%)",
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.58) 100%)",
        }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="px-6 text-center">
          <h1 className="font-serif text-5xl font-light leading-none tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-[120px]">
            THE ART OF
            <br />
            BRAIDING
          </h1>
          <p className="mt-6 text-sm font-light uppercase tracking-[0.3em] text-white/80 sm:text-base">
            Luxury Hair Craft Since 2023
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2">
        <span className="text-xs uppercase tracking-widest text-white/60">
          Scroll
        </span>
        <div className="h-8 w-px animate-pulse bg-white/40" />
      </div>
    </section>
  );
}
