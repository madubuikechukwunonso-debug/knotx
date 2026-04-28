// src/src-pages/GalleryPage.tsx
'use client';

import { useMemo, useState } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

// ====================== TYPE DEFINITION (matches your Prisma GalleryItem) ======================
type GalleryItem = {
  id: number;
  type: string;           // 'image' or 'video'
  url: string;
  thumbnailUrl?: string | null;
  title?: string | null;
  caption?: string | null;
  description?: string | null;
  category?: string | null;
  isActive: boolean;
  sortOrder: number;
};

// ====================== FILTERS (kept exactly as you had) ======================
const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Knotless', value: 'knotless' },
  { label: 'Stitch', value: 'stitch braid' },
  { label: 'Creative', value: 'creative' },
  { label: 'Luxury', value: 'luxury' },
] as const;

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]['value']>('all');

  // TODO: This will be replaced with real data fetched from Prisma (see note below)
  // For now it's typed so the build passes
  const galleryItems: GalleryItem[] = [];

  // Filter logic (exactly like your original)
  const filtered = useMemo(() => {
    if (activeFilter === 'all') return galleryItems;
    return galleryItems.filter(
      (item) => item.category?.toLowerCase() === activeFilter
    );
  }, [activeFilter, galleryItems]);

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f5f0] pt-28 text-black">
        {/* HEADER SECTION */}
        <section className="px-6 pb-10 pt-8 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-black/45">KNOTXANDKRAFTS</p>

            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-3xl">
                <h1 className="font-serif text-5xl leading-[0.95] md:text-7xl">Gallery</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-black/65 md:text-base">
                  A curated visual archive of braid artistry, texture, precision, and finish. 
                  Browse featured looks and explore the styles shaping the KNOTXANDKRAFTS experience.
                </p>
              </div>
            </div>

            {/* FILTER BUTTONS */}
            <div className="mt-10 flex flex-wrap gap-3">
              {FILTERS.map((filter) => {
                const isActive = filter.value === activeFilter;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setActiveFilter(filter.value)}
                    className={`px-4 py-2 text-[11px] uppercase tracking-[0.28em] transition-all duration-300 ${
                      isActive
                        ? 'bg-black text-white'
                        : 'border border-black/15 bg-white text-black/65 hover:border-black/35 hover:text-black'
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* GALLERY GRID - REAL DATA READY */}
        <section className="px-6 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="text-black/40 text-lg">
                    {galleryItems.length === 0
                      ? 'No gallery items yet. Upload some in the admin panel!'
                      : 'No items match this filter.'}
                  </p>
                </div>
              ) : (
                filtered.map((item, index) => (
                  <article
                    key={item.id}
                    className={`group overflow-hidden bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] ${
                      index % 5 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''
                    }`}
                  >
                    <div className={`${index % 5 === 0 ? 'aspect-[16/10]' : 'aspect-[4/5]'} overflow-hidden`}>
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          muted
                          loop
                          playsInline
                          autoPlay
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.title || 'Gallery item'}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        />
                      )}
                    </div>

                    <div className="p-5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-black/45">
                        {item.category || 'general'}
                      </p>
                      <h2 className="mt-2 font-serif text-2xl text-black">
                        {item.title || 'Braided Look'}
                      </h2>
                      <p className="mt-3 text-sm leading-6 text-black/60 line-clamp-3">
                        {item.caption || item.description || 'Precision styling and beautiful finish.'}
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
