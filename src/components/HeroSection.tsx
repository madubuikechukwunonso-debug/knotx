'use client';

import { useEffect, useState } from "react";

interface HeroVideo {
  id: number;
  url: string;
  name: string;
}

export default function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [heroVideos, setHeroVideos] = useState<HeroVideo[]>([]);

  // Default videos (fallback when no uploads exist)
  const defaultVideos = [
    "/videos/1.webm",
    "/videos/2.webm",
    "/videos/3.webm",
    "/videos/4.webm",
  ];

  // Fetch videos from database
  useEffect(() => {
    const fetchHeroVideos = async () => {
      try {
        const res = await fetch('/api/admin/media', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          // Filter only hero videos
          const videos = data.heroVideos || [];
          setHeroVideos(videos);
        }
      } catch (error) {
        console.error("Failed to fetch hero videos:", error);
      }
    };

    fetchHeroVideos();
    setMounted(true);
  }, []);

  // Determine which videos to display
  const videosToShow = heroVideos.length > 0 
    ? heroVideos.map(v => v.url) 
    : defaultVideos;

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black">
      {/* Video grid */}
      <div
        className={`absolute inset-0 grid grid-cols-2 grid-rows-2 transition-opacity duration-1000 ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
      >
        {videosToShow.map((src, index) => (
          <div
            key={index}
            className="relative h-full w-full overflow-hidden bg-neutral-900"
          >
            <video
              className="h-full w-full object-cover scale-[1.03]"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controls={false}
              webkit-playsinline=""
              x5-playsinline=""
              x5-video-player-fullscreen="true"
            >
              <source src={src} type="video/webm" />
            </video>

            {/* Overlays */}
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

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/55" />
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(circle at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.28) 35%, rgba(0,0,0,0.58) 100%)",
        }}
      />

      {/* Hero Text */}
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
