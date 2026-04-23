'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

type Product = { id: number; name: string; price: number; image?: string | null; };

export default function ProductsSection() {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/products?featured=1').then((r) => r.json()).then((d) => setProducts(d.products || [])).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true); observer.disconnect();
      }
    }, { threshold: 0.15 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return (
    <section ref={ref} className="w-full bg-white py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className={`mb-16 text-center transition-all duration-1000 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <h2 className="font-serif text-4xl font-light sm:text-5xl lg:text-6xl">Curated Essentials</h2>
          <p className="mt-4 text-sm uppercase tracking-widest text-black/50">Premium hair care products</p>
        </div>
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8">
          {products.map((product, i) => (
            <div key={product.id} className={`group transition-all duration-700 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`} style={{ transitionDelay: `${200 + i * 100}ms` }}>
              <Link href="/shop" className="block">
                <div className="relative mb-4 aspect-[3/4] overflow-hidden bg-[#f6f6f6]">
                  <img src={product.image || '/images/products/hair-oil.jpg'} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <button onClick={(e) => { e.preventDefault(); addItem({ productId: product.id, name: product.name, price: product.price, quantity: 1, image: product.image || '' }); }} className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:bg-black hover:text-white">
                    <ShoppingBag className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-sm font-medium text-black transition-opacity group-hover:opacity-60">{product.name}</h3>
                <p className="mt-1 text-sm text-black/50">{formatPrice(product.price)}</p>
              </Link>
            </div>
          ))}
        </div>
        <div className={`mt-16 text-center transition-all delay-700 duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>
          <Link href="/shop" className="inline-block border-b border-black pb-1 text-sm font-medium uppercase tracking-widest transition-opacity hover:opacity-60">View All Products</Link>
        </div>
      </div>
    </section>
  );
}
