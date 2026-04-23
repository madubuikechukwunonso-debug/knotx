"use client";

import { useEffect, useRef } from "react";
import { galleryImages } from "@/lib/galleryImages";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function HomeGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 80 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
              delay: i * 0.1,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#f7f3ee] px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/45">Gallery</p>
            <h2 className="font-serif text-4xl leading-tight text-black md:text-5xl">
              A closer look at the craft
            </h2>
          </div>

          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 self-start border border-black px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition-all hover:bg-black hover:text-white"
          >
            View Full Gallery
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.slice(0, 3).map((image, index) => (
            <div
              key={image.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              className="group relative overflow-hidden bg-neutral-200 aspect-[4/5]"
            >
              <img
                src={image.src}
                alt={image.alt}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/70">
                  {image.category}
                </p>
                <p className="mt-2 font-serif text-2xl">Signature Style</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
