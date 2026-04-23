"use client";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function ServicesSection() {
  return (
    <section className="w-full">
      <div className="flex min-h-[600px] flex-col lg:min-h-[700px] lg:flex-row">
        <div className="flex w-full items-center justify-center bg-black p-12 text-white lg:w-1/2 lg:p-20">
          <div className="max-w-md">
            <h2 className="mb-6 font-serif text-4xl font-light leading-tight sm:text-5xl lg:text-6xl">Book Your<br />Session</h2>
            <p className="mb-8 text-sm leading-relaxed text-white/60">Experience the art of bespoke braiding in our luxury salon. Our master stylists create personalized braided masterpieces tailored to your unique style and hair texture. From consultation to completion, every detail is crafted with precision and care.</p>
            <Link href="/booking" className="group inline-flex items-center gap-3 bg-white px-8 py-4 text-sm font-medium uppercase tracking-widest text-black transition-all duration-300 hover:bg-white/90">View Availability<ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" /></Link>
          </div>
        </div>
        <div className="w-full overflow-hidden lg:w-1/2">
          <div className="group h-full min-h-[400px] w-full lg:min-h-0">
            <img src="/images/services/braiding-service.jpg" alt="Luxury braiding service" className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105" />
          </div>
        </div>
      </div>
    </section>
  );
}
