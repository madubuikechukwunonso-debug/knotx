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
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900 px-4 py-1 text-sm font-medium text-emerald-400 mb-4">
            REAL STORIES
          </div>
          <h2 className="font-serif text-5xl sm:text-6xl text-white tracking-tight">
            Loved by Our Community
          </h2>
          <p className="mt-4 max-w-md mx-auto text-lg text-emerald-300">
            Real words from real clients who trusted us with their hair journey.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.08,
                ease: [0.23, 1, 0.32, 1]
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group relative bg-white rounded-3xl p-8 shadow-xl flex flex-col h-full"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 -left-4 bg-emerald-600 text-white p-4 rounded-2xl shadow-lg">
                <Quote className="h-6 w-6" />
              </div>

              {/* Rating Stars */}
              <div className="flex mb-6 mt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-emerald-950 text-[15px] leading-relaxed flex-1 mb-8">
                “{review.comment}”
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-emerald-100">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {review.emoji || '👩🏾'}
                </div>
                <div>
                  <p className="font-semibold text-emerald-950">{review.customerName}</p>
                  <p className="text-xs text-emerald-600">
                    {review.serviceType || 'Hair Service'} • {new Date(review.createdAt).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-emerald-400 text-sm tracking-[3px] mb-3">JOIN THOUSANDS OF HAPPY CLIENTS</p>
          <a 
            href="/rateus" 
            className="inline-flex items-center gap-3 text-lg font-medium text-white hover:text-emerald-300 transition-colors group"
          >
            Share Your Experience
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
