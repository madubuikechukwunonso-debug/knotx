"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";

gsap.registerPlugin(ScrollTrigger);

type Product = {
  id: number;
  name: string;
  price: number;
  image?: string | null;
};

export default function ProductsSection({
  products,
}: {
  products: Product[];
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        gsap.fromTo(
          card,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section ref={sectionRef} className="w-full bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-light sm:text-5xl lg:text-6xl">
            Curated Essentials
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {products?.map((product, i) => (
            <div
              key={product.id}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="group"
            >
              <Link href="/shop">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f6f6f6]">
                  <img
                    src={product.image || "/images/products/hair-oil.jpg"}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>

                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-black/50">
                  {formatPrice(product.price)}
                </p>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
