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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedReviews, setDisplayedReviews] = useState<Review[]>([]);

  // Auto-rotate every 6 seconds
  useEffect(() => {
    if (!reviews || reviews.length === 0) return;

    // Set initial 3 reviews
    setDisplayedReviews(reviews.slice(0, 3));

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = (prev + 3) % reviews.length;
        const nextReviews = reviews.slice(nextIndex, nextIndex + 3);
        
        // If we don't have 3 reviews left, loop back to start
        const finalReviews = nextReviews.length === 3 
          ? nextReviews 
          : [...nextReviews, ...reviews.slice(0, 3 - nextReviews.length)];
        
        setDisplayedReviews(finalReviews);
        return nextIndex;
      });
    }, 6000); // Change every 6 seconds

    return () => clearInterval(interval);
  }, [reviews]);

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#f7f3ee] px-6 py-20 md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        {/* Header - Matching Gallery Style */}
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

        {/* Reviews Grid with Animated Swapping */}
        <div className="relative min-h-[520px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.7, ease: [0.21, 0.92, 0, 1] }}
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {displayedReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: index * 0.1 
                  }}
                  whileHover={{ y: -10 }}
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
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Note + Progress Indicator */}
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <p className="text-black/50 text-sm tracking-[2px]">Real reviews from real clients</p>
          
          {/* Subtle progress dots */}
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(reviews.length / 3) }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  Math.floor(currentIndex / 3) === i 
                    ? 'w-8 bg-black' 
                    : 'w-1.5 bg-black/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
