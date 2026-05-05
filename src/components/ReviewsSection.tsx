'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);

  // Initialize with first 3 reviews
  useEffect(() => {
    if (reviews.length > 0) {
      setDisplayedReviews(reviews.slice(0, 3));
    }
  }, [reviews]);

  // Individual cycling for each review position with different timings
  useEffect(() => {
    if (!reviews || reviews.length === 0 || displayedReviews.length === 0) return;

    const intervals: NodeJS.Timeout[] = [];

    // Different timings for each position (in ms)
    const timings = [7000, 8500, 6200]; // Slightly different speeds

    displayedReviews.forEach((currentReview, positionIndex) => {
      const interval = setInterval(() => {
        setDisplayedReviews((prev) => {
          const newReviews = [...prev];
          const current = newReviews[positionIndex];

          // Find next review (avoid showing one that's already displayed)
          let nextIndex = (reviews.findIndex(r => r.id === current.id) + 1) % reviews.length;
          let attempts = 0;

          while (
            newReviews.some(r => r.id === reviews[nextIndex].id) && 
            attempts < reviews.length
          ) {
            nextIndex = (nextIndex + 1) % reviews.length;
            attempts++;
          }

          newReviews[positionIndex] = reviews[nextIndex];
          return newReviews;
        });
      }, timings[positionIndex]);

      intervals.push(interval);
    });

    return () => intervals.forEach(clearInterval);
  }, [reviews, displayedReviews]);

  if (!reviews || reviews.length === 0 || displayedReviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f7f3ee] px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/45">Testimonials</p>
            <h2 className="font-serif text-4xl leading-tight text-black md:text-5xl">
              What Our Clients Say
            </h2>
          </div>
          <a
            href="/rateus"
            className="inline-flex items-center gap-2 self-start border border-black px-5 py-3 text-[11px] uppercase tracking-[0.28em] text-black transition-all hover:bg-black hover:text-white"
          >
            Share Your Story
            <span className="text-lg">→</span>
          </a>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayedReviews.map((review, index) => (
            <AnimatePresence mode="wait" key={review.id}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ 
                  duration: 0.9,                    // ← Slow, smooth fade
                  ease: [0.21, 0.92, 0, 1] 
                }}
                whileHover={{ y: -8 }}
                className="group relative bg-white rounded-3xl p-9 shadow-xl flex flex-col h-full border border-black/5"
              >
                {/* Quote Icon */}
                <div className="absolute -top-5 -left-5 bg-black text-white p-4 rounded-2xl shadow-lg">
                  <Quote className="h-6 w-6" />
                </div>

                {/* Stars */}
                <div className="flex mb-8 mt-6">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-black/20'}`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <p className="text-black/80 text-[15px] leading-relaxed flex-1 mb-10 font-light">
                  “{review.comment}”
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-black/10">
                  <div className="h-14 w-14 rounded-full bg-[#f7f3ee] flex items-center justify-center text-3xl flex-shrink-0 ring-4 ring-white">
                    {review.emoji || '👩🏾'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-black text-lg tracking-tight">
                      {review.customerName}
                    </p>
                    <p className="text-sm text-black/60 mt-0.5">
                      {review.serviceType || 'Hair Service'} • {new Date(review.createdAt).toLocaleDateString('en-CA', { month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <p className="text-black/50 text-sm tracking-[2px]">Real reviews from real clients</p>
        </div>
      </div>
    </section>
  );
}
