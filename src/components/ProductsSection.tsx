"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function ProductsSection({ products }: { products: any[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
              delay: i * 0.08,
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section ref={sectionRef} className="w-full bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light">
            Curated Essentials
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {products?.map((product, i) => (
            <div
              key={product.id}
              ref={(el) => {
                if (el) cardsRef.current[i] = el;
              }}
              className="group"
            >
              <Link href="/shop">
                <div className="relative aspect-[3/4] overflow-hidden bg-[#f6f6f6] mb-4">
                  <img
                    src={product.image || "/images/products/hair-oil.jpg"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm text-black/50 mt-1">{formatPrice(product.price)}</p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
