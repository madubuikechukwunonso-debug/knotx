"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ServicesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        sectionRef.current,
        { opacity: 0, y: 80 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="w-full">
      <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px]">
        {/* Left Text */}
        <div className="w-full lg:w-1/2 bg-black text-white flex items-center justify-center p-12 lg:p-20">
          <div className="max-w-md">
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-6">
              Book Your
              <br />
              Session
            </h2>
            <p className="text-white/60 text-sm leading-relaxed mb-8">
              Experience the art of excellent african braiding in our luxury salon.
            </p>
            <Link
              href="/booking"
              className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 text-sm uppercase tracking-widest font-medium hover:bg-white/90 transition-all"
            >
              View Availability
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Right Image */}
        <div className="w-full lg:w-1/2 overflow-hidden">
          <img
            src="/images/services/braiding-service.jpg"
            alt="Luxury braiding service"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
