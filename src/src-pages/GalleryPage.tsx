// src/src-pages/GalleryPage.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

type GalleryItem = {
  id: number;
  type: string;
  url: string;
  title?: string | null;
  caption?: string | null;
  description?: string | null;
  category?: string | null;
};

const FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Knotless', value: 'knotless' },
  { label: 'Stitch', value: 'stitch braid' },
  { label: 'Creative', value: 'creative' },
  { label: 'Luxury', value: 'luxury' },
] as const;

type Props = {
  initialItems: GalleryItem[];
};

export default function GalleryPage({ initialItems }: Props) {
  const [activeFilter, setActiveFilter] = useState<typeof FILTERS[number]['value']>('all');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return initialItems;
    return initialItems.filter(
      (item) => item.category?.toLowerCase() === activeFilter
    );
  }, [activeFilter, initialItems]);

  return (
    <>
      <Navigation />

      <main className="min-h-screen bg-[#f8f5f0] pt-28 text-black">
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

        {/* GALLERY GRID */}
        <section className="px-6 pb-20 md:px-10 lg:px-16">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.length === 0 ? (
                <div className="col-span-full py-20 text-center">
                  <p className="text-black/40 text-lg">
                    {initialItems.length === 0
                      ? 'No gallery items yet. Upload some in the admin panel!'
                      : 'No items match this filter.'}
                  </p>
                </div>
              ) : (
                filtered.map((item, index) => (
                  <article
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`group cursor-pointer overflow-hidden bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)] ${
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

      {/* FULL-SCREEN VIEWER / LIGHTBOX */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col bg-white rounded-3xl overflow-hidden"
            onClick={(e) => e.stopImmediatePropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 z-10 text-white bg-black/60 hover:bg-black/80 rounded-full p-3 transition-colors"
            >
              ✕
            </button>

            {/* Media */}
            <div className="flex-1 flex items-center justify-center bg-black p-4">
              {selectedItem.type === 'video' ? (
                <video
                  src={selectedItem.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-auto max-w-full rounded-2xl"
                />
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title || ''}
                  className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain"
                />
              )}
            </div>

            {/* Info */}
            <div className="p-8 bg-white">
              {selectedItem.title && (
                <h2 className="text-3xl font-serif text-black mb-2">{selectedItem.title}</h2>
              )}
              {selectedItem.caption && (
                <p className="text-lg text-black/70 mb-3">{selectedItem.caption}</p>
              )}
              {selectedItem.description && (
                <p className="text-black/60 leading-relaxed">{selectedItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
