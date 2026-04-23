'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="w-full bg-[#f6f6f6] py-24 lg:py-32">
      <div className={`mx-auto max-w-xl px-6 text-center transition-all duration-1000 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
        <h2 className="font-serif text-3xl font-light sm:text-4xl lg:text-5xl">Join the Inner Circle</h2>
        <p className="mb-10 mt-4 text-sm text-black/50">Exclusive offers, styling tips, and early access to new collections.</p>
        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-green-600"><Check className="h-5 w-5" /><span className="text-sm font-medium">Thank you for subscribing</span></div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (email) setSubmitted(true); }} className="flex flex-col gap-3 sm:flex-row">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="flex-1 border-0 bg-white px-6 py-4 text-sm outline-none focus:ring-1 focus:ring-black/20" required />
            <button type="submit" className="flex items-center justify-center gap-2 bg-black px-8 py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-black/80">Subscribe<ArrowRight className="h-4 w-4" /></button>
          </form>
        )}
      </div>
    </section>
  );
}
