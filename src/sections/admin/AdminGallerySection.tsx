// src/sections/admin/AdminGallerySection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Eye, Star, Upload } from 'lucide-react';

export default function AdminGallerySection() {
  const [items, setItems] = useState<any[]>([]);

  // TODO: Replace this with real Prisma fetch later (via API route or Server Component wrapper)
  useEffect(() => {
    // Mock data for now - you can fetch from /api/gallery later
    setItems([]);
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newItems: any[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const mimeType = file.type;
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const isVideo = file.type.startsWith('video/');

      newItems.push({
        id: Date.now() + Math.random(),
        type: isVideo ? 'video' : 'image',
        title: file.name.replace(/\.\w+$/, ''),
        caption: '',
        url: dataUrl,
        thumbnailUrl: dataUrl,
        isFeatured: false,
        isActive: true,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    // TODO: Send to real server action / API route here
  };

  const toggleActive = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
  };

  const deleteItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    // TODO: Call real delete server action here
  };

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

        {/* FILE UPLOAD FORM */}
        <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm cursor-pointer w-full sm:w-auto justify-center sm:justify-start">
          <Upload size={20} />
          <span className="font-medium">Add Images / Videos or Folder</span>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            // @ts-expect-error webkitdirectory is a non-standard WebKit attribute
            webkitdirectory=""
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* GALLERY GRID – Fully responsive & mobile-first */}
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

              {/* Status badges */}
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
              <button
                onClick={() => toggleActive(item.id)}
                className="flex items-center gap-1 hover:text-emerald-700 transition-colors"
              >
                <Eye size={16} />
                {item.isActive ? 'Hide' : 'Show'}
              </button>

              <button
                onClick={() => deleteItem(item.id)}
                className="p-2 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
              >
                <Trash2 size={16} />
              </button>
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
            Click the button above and choose files or an entire folder
          </p>
        </div>
      )}
    </div>
  );
}
