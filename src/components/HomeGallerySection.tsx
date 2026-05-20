'use client';

import { useEffect, useRef, useState } from "react";
import { galleryImages as defaultGalleryImages } from "@/lib/galleryImages";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface GalleryImage {
  id: number;
  url: string;
  name?: string;
}

export default function HomeGallerySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [images, setImages] = useState<any[]>(defaultGalleryImages.slice(0, 3));

  // Fetch images from database (same as Admin Dashboard)
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const res = await fetch('/api/admin/media', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const dbImages = data.galleryImages || [];

          // If we have uploaded images, use them. Otherwise keep defaults.
          if (dbImages.length > 0) {
            // Use first 3 uploaded images
            const selectedImages = dbImages.slice(0, 3).map((img: GalleryImage, index: number) => ({
              id: img.id,
              src: img.url,
              alt: img.name || `Gallery Image ${index + 1}`,
              category: "Signature Style",
            }));
            setImages(selectedImages);
          }
        }
      } catch (error) {
        console.error("Failed to fetch gallery images:", error);
        // Keep default images on error
      }
    };

    fetchGalleryImages();
  }, []);

  // GSAP Animation (unchanged)
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
            delay: i * 0.1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [images]); // Re-run animation when images change

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
          {images.map((image, index) => (
            <div
              key={image.id || index}
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
