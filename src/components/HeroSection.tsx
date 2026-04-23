"use client";

import { useEffect, useMemo, useState } from "react";

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);

  const videos = useMemo(
    () => [
      "/videos/1.webm",
      "/videos/2.webm",
      "/videos/3.webm",
      "/videos/4.webm",
    ],
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video grid */}
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
              className="h-full w-full object-cover scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"           // ← Added
              controls={false}
              webkit-playsinline=""    // ← Important for iOS
              x5-playsinline=""        // ← Important for Android
              x5-video-player-fullscreen="true"
            >
              <source src={src} type="video/webm" />
            </video>

            <div className="absolute inset-0 bg-black/20" />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(circle at center, transparent 35%, rgba(0,0,0,0.38) 100%)",
              }}
            />
          </div>
        ))}
      </div>

      {/* Overlays and text - same as before */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.58) 100%)",
        }}
      />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <div className="px-6 text-center">
          <h1 className="font-serif text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[120px] font-light tracking-tight leading-none">
            THE ART OF
            <br />
            BRAIDING
          </h1>
          <p className="mt-6 text-white/80 text-sm sm:text-base uppercase tracking-[0.3em] font-light">
            Luxury Hair Craft Since 2023
          </p>
        </div>
      </div>
    </section>
  );
}
