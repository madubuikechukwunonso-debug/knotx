'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

interface Review {
  id: number;
  customerName: string;
  rating: number;
  emoji: string | null;
  comment: string | null;
  serviceType: string | null;
  createdAt: Date | string;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-emerald-950 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Elegant Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/80 px-5 py-1.5 text-sm font-medium text-emerald-400 tracking-[2px] mb-6">
            REAL STORIES • REAL CLIENTS
          </div>

          <h2 className="font-serif text-6xl sm:text-7xl text-white tracking-tight leading-none">
            Loved by Our<br />Community
          </h2>

          <p className="mt-6 max-w-lg mx-auto text-xl text-emerald-300 font-light">
            Real words from clients who trusted us with their hair journey.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.7, 
                delay: index * 0.07,
                ease: [0.21, 0.92, 0, 1]
              }}
              whileHover={{ 
                y: -12,
                transition: { duration: 0.4, ease: "easeOut" }
              }}
              className="group relative bg-white rounded-3xl p-9 shadow-2xl flex flex-col h-full border border-emerald-100/50"
            >
              {/* Quote Icon */}
              <div className="absolute -top-5 -left-5 bg-emerald-700 text-white p-4 rounded-2xl shadow-lg">
                <Quote className="h-7 w-7" />
              </div>

              {/* Stars */}
              <div className="flex mb-7 mt-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} 
                  />
                ))}
              </div>

              {/* Review Comment */}
              <p className="text-emerald-950 text-[15px] leading-relaxed flex-1 mb-9 font-light">
                “{review.comment}”
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-emerald-100">
                <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-3xl flex-shrink-0 ring-4 ring-white">
                  {review.emoji || '👩🏾'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-emerald-950 text-lg tracking-tight">
                    {review.customerName}
                  </p>
                  <p className="text-sm text-emerald-600 mt-0.5">
                    {review.serviceType || 'Hair Service'} • {new Date(review.createdAt).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-emerald-400 text-sm tracking-[3px] mb-4 font-medium">JOIN THOUSANDS OF HAPPY CLIENTS</p>
          
          <a 
            href="/rateus" 
            className="inline-flex items-center gap-4 text-2xl font-serif text-white hover:text-emerald-300 transition-colors group"
          >
            Share Your Experience
            <span className="group-hover:translate-x-1.5 transition-transform text-3xl">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
