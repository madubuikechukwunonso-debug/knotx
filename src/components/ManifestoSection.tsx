'use client';
import { useEffect, useRef, useState } from 'react';

export default function ManifestoSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-white py-24 lg:py-40">
      <div className="mx-auto max-w-5xl px-6 text-center lg:px-12">
        <p className={`text-3xl leading-snug text-black/90 transition-all duration-1000 sm:text-4xl md:text-5xl lg:text-6xl lg:leading-tight ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{ fontFamily: 'cursive' }}>
          Every strand tells a story, At KNOTXANDKRAFTS.
        </p>
        <p className={`mx-auto mt-8 max-w-3xl text-sm leading-8 text-black/65 transition-all delay-200 duration-1000 sm:text-base md:text-lg ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          From clean parts to polished finishes, every detail matters. Our work is rooted in patience, softness, and precision, designed to help each client feel confident, seen, and beautifully put together. We blend tradition with modern elegance, creating styles that protect the hair, elevate the overall look, and make every appointment feel like an experience worth remembering.
        </p>
        <div className={`mt-12 transition-all delay-300 duration-1000 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}><div className="mx-auto h-px w-16 bg-black/20" /></div>
      </div>
    </section>
  );
}
