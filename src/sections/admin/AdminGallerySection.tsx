// src/sections/admin/AdminGallerySection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { Trash2, Eye, Star, Upload } from 'lucide-react';
import GalleryUploadControls from './GalleryUploadControls';
import { deleteGalleryItem, toggleActive } from './gallery-actions';

const prisma = new PrismaClient();

export default async function AdminGallerySection() {
  const items = await prisma.galleryItem.findMany({
    orderBy: { sortOrder: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Gallery</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {items.length} item{items.length !== 1 ? 's' : ''} • Visual storytelling
          </p>
        </div>
        <GalleryUploadControls />
      </div>

      {/* GALLERY GRID – Your original beautiful design */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative aspect-square">
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.title || 'Gallery item'}
                  className="w-full h-full object-cover"
                />
              )}
              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {item.isFeatured && (
                  <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-medium px-2 py-px rounded-2xl">
                    <Star size={12} /> Featured
                  </span>
                )}
                {item.isActive ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-medium px-2 py-px rounded-2xl">
                    Active
                  </span>
                ) : (
                  <span className="bg-red-400 text-white text-[10px] font-medium px-2 py-px rounded-2xl">
                    Hidden
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <p className="font-medium text-emerald-950 line-clamp-2 text-sm">{item.title}</p>
              {item.caption && (
                <p className="text-xs text-emerald-500 mt-1 line-clamp-2">{item.caption}</p>
              )}
            </div>
            {/* Actions */}
            <div className="border-t border-emerald-100 px-4 py-3 flex items-center justify-between text-xs">
              <form action={toggleActive}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="flex items-center gap-1 hover:text-emerald-700 transition-colors"
                >
                  <Eye size={16} />
                  {item.isActive ? 'Hide' : 'Show'}
                </button>
              </form>
              <form action={deleteGalleryItem}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className="p-2 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
      {/* Empty state */}
      {items.length === 0 && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
          <p className="text-emerald-500 text-lg">Your gallery is empty</p>
          <p className="text-emerald-400 text-sm mt-2">
            Use “Upload” or “Take Photo” above to add images and videos
          </p>
        </div>
      )}
    </div>
  );
}
