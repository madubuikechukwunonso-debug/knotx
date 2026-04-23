"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ManifestoSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-white py-24 lg:py-40"
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center">
        <p
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-snug lg:leading-tight text-black/90"
          style={{ fontFamily: "cursive" }}
        >
          Every strand tells a story, at KNOTXANDKRAFTS.
        </p>

        <p className="mt-8 max-w-3xl mx-auto text-sm sm:text-base md:text-lg leading-8 text-black/65">
          From clean parts to polished finishes, every detail matters. Our work
          is rooted in patience, softness, and precision, designed to help each
          client feel confident, seen, and beautifully put together.
        </p>

        <div className="mt-12 w-16 h-px bg-black/20 mx-auto" />
      </div>
    </section>
  );
}
