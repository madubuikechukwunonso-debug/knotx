// src/sections/admin/AdminGallerySection.tsx
'use client';

import { useState, useEffect } from 'react';
import { Trash2, Eye, Star, Upload, Camera } from 'lucide-react';

export default function AdminGallerySection() {
  const [items, setItems] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);

  // Fetch gallery items from API
  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/gallery');
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch gallery items');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Handle file upload (picker + folder + camera)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64 = btoa(String.fromCharCode(...uint8Array)); // Browser-safe base64
        const dataUrl = `data:${file.type};base64,${base64}`;

        const isVideo = file.type.startsWith('video/');

        const res = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: isVideo ? 'video' : 'image',
            title: file.name.replace(/\.\w+$/, ''),
            url: dataUrl,
            thumbnailUrl: dataUrl,
            category: 'general',
          }),
        });

        if (!res.ok) console.error('Upload failed for', file.name);
      } catch (err) {
        console.error('Error uploading file', err);
      }
    }

    setUploading(false);
    fetchItems(); // Refresh list
    e.target.value = ''; // Clear input
  };

  // Toggle active status
  const toggleActive = async (id: number) => {
    try {
      const item = items.find((i) => i.id === id);
      if (!item) return;

      await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });

      fetchItems();
    } catch (err) {
      console.error('Toggle failed');
    }
  };

  // Delete item
  const deleteItem = async (id: number) => {
    if (!confirm('Delete this gallery item permanently?')) return;

    try {
      await fetch(`/api/admin/gallery?id=${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err) {
      console.error('Delete failed');
    }
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

        <div className="flex gap-3">
          {/* Camera Capture */}
          <label className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-3 rounded-3xl transition-colors shadow-sm cursor-pointer">
            <Camera size={20} />
            <span className="font-medium text-sm">Camera</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* File / Folder Picker */}
          <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm cursor-pointer">
            <Upload size={20} />
            <span className="font-medium">Add Images / Videos or Folder</span>
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              // @ts-expect-error webkitdirectory is non-standard
              webkitdirectory=""
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
          >
            <div className="relative aspect-square">
              {item.type === 'video' ? (
                <video src={item.url} className="w-full h-full object-cover" muted loop />
              ) : (
                <img src={item.url} alt={item.title || 'Gallery item'} className="w-full h-full object-cover" />
              )}

              {/* Badges */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                {item.isFeatured && (
                  <span className="flex items-center gap-1 bg-yellow-400 text-yellow-900 text-[10px] font-medium px-2 py-px rounded-2xl">
                    <Star size={12} /> Featured
                  </span>
                )}
                {item.isActive ? (
                  <span className="bg-emerald-500 text-white text-[10px] font-medium px-2 py-px rounded-2xl">Active</span>
                ) : (
                  <span className="bg-red-400 text-white text-[10px] font-medium px-2 py-px rounded-2xl">Hidden</span>
                )}
              </div>
            </div>

            <div className="p-4">
              <p className="font-medium text-emerald-950 line-clamp-2 text-sm">{item.title}</p>
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
            Use the buttons above to add images, videos, or take a photo
          </p>
        </div>
      )}

      {uploading && <p className="text-center text-emerald-600 text-sm">Uploading files...</p>}
    </div>
  );
}
