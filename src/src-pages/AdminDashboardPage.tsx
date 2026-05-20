'use client';

import { useState, useEffect } from 'react';
import {
  Users, DollarSign, ShoppingCart, Calendar, RefreshCw, Upload, Video, Image as ImageIcon
} from 'lucide-react';
import { put } from '@vercel/blob';
import { galleryImages as defaultGalleryImages } from '@/lib/galleryImages';

interface MediaItem {
  id?: number;
  url: string;
  name: string;
}

interface OverviewData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalBookings: number;
    revenueFromOrders?: number;
    revenueFromBookings?: number;
  };
  recentUsers: any[];
  recentOrders: any[];
  recentBookings: any[];
  liveVisitors?: any[];
}

export default function AdminOverviewSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [heroVideos, setHeroVideos] = useState<MediaItem[]>([]);
  const [galleryImagesState, setGalleryImagesState] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);

  // Pending files for batch save
  const [pendingVideos, setPendingVideos] = useState<(File | null)[]>([null, null, null, null]);
  const [pendingImages, setPendingImages] = useState<(File | null)[]>([null, null, null]);

  const defaultVideos = [
    { url: "/videos/1.webm", name: "Hero Video 1" },
    { url: "/videos/2.webm", name: "Hero Video 2" },
    { url: "/videos/3.webm", name: "Hero Video 3" },
    { url: "/videos/4.webm", name: "Hero Video 4" },
  ];

  async function fetchData(isManual = false) {
    if (!isManual) setLoading(true);
    try {
      const [overviewRes, mediaRes] = await Promise.all([
        fetch('/api/admin/overview', { cache: 'no-store' }),
        fetch('/api/admin/media', { cache: 'no-store' }),
      ]);

      const overviewData = await overviewRes.json();
      const mediaData = await mediaRes.json();

      setData(overviewData);

      const dbVideos = mediaData.heroVideos || [];
      const mergedVideos = defaultVideos.map((defaultVideo, index) => {
        const dbVideo = dbVideos[index];
        return dbVideo
          ? { id: dbVideo.id, url: dbVideo.url, name: dbVideo.name || defaultVideo.name }
          : defaultVideo;
      });
      setHeroVideos(mergedVideos);

      const dbImages = mediaData.galleryImages || [];
      const realGallery = defaultGalleryImages.slice(0, 3).map((img, index) => ({
        id: img.id,
        url: img.src,
        name: img.alt || `Gallery Image ${index + 1}`,
      }));

      const mergedImages = realGallery.map((defaultImg, index) => {
        const dbImg = dbImages[index];
        return dbImg
          ? { id: dbImg.id, url: dbImg.url, name: dbImg.name || defaultImg.name }
          : defaultImg;
      });

      setGalleryImagesState(mergedImages);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(error);
    } finally {
      if (!isManual) setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 15000);
    return () => clearInterval(interval);
  }, []);

  // Handle file selection for a specific slot (does NOT upload yet)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'hero' | 'gallery', index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'hero') {
      const newPending = [...pendingVideos];
      newPending[index] = file;
      setPendingVideos(newPending);
    } else {
      const newPending = [...pendingImages];
      newPending[index] = file;
      setPendingImages(newPending);
    }
  };

  // Save ALL pending files at once
  const handleSaveAll = async () => {
    const hasAllVideos = pendingVideos.every(f => f !== null);
    const hasAllImages = pendingImages.every(f => f !== null);

    if (!hasAllVideos || !hasAllImages) {
      alert("Please upload all 4 videos AND all 3 images before saving.");
      return;
    }

    setUploading(true);

    try {
      // Upload all videos
      for (let i = 0; i < pendingVideos.length; i++) {
        const file = pendingVideos[i];
        if (file) {
          const blob = await put(`hero/${file.name}`, file, {
            access: 'public',
            token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
          });
          await fetch('/api/admin/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'hero', url: blob.url, name: file.name }),
          });
        }
      }

      // Upload all images
      for (let i = 0; i < pendingImages.length; i++) {
        const file = pendingImages[i];
        if (file) {
          const blob = await put(`gallery/${file.name}`, file, {
            access: 'public',
            token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
          });
          await fetch('/api/admin/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'gallery', url: blob.url, name: file.name }),
          });
        }
      }

      alert("All 4 videos and 3 images saved successfully!");
      setPendingVideos([null, null, null, null]);
      setPendingImages([null, null, null]);
      await fetchData(true);
    } catch (error) {
      alert("Failed to save all media.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const canSaveAll = pendingVideos.every(f => f !== null) && pendingImages.every(f => f !== null);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <div className="space-y-8 bg-[#0f172a] min-h-screen p-6 text-white">
      
      {/* Version Badge */}
      <div className="bg-[#1e2937] border border-pink-500/30 rounded-2xl p-4 text-center">
        <span className="font-mono text-pink-400 text-sm tracking-[4px]">VERSION 7 — FINAL</span>
      </div>

      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-slate-400 mt-1">Real-time overview • KnotX &amp; Krafts</p>
      </div>

      {/* Stats + Revenue Breakdown (keep your existing code) */}
      {/* ... (your stats section here) ... */}

      {/* Live Visitors + Recent Activity (keep your existing code) */}
      {/* ... (your live visitors section here) ... */}

      {/* === MEDIA MANAGEMENT (BATCH MODE) === */}
      <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Upload className="text-pink-400" /> Media Management
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Upload all 4 videos + all 3 images, then click "Save All Changes"
            </p>
          </div>

          <button
            onClick={handleSaveAll}
            disabled={!canSaveAll || uploading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-2xl font-medium text-sm transition-all"
          >
            {uploading ? "Saving..." : "Save All Changes"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Hero Videos - 4 Slots */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Video className="text-pink-400" />
              <h4 className="font-semibold text-lg">Hero Section Videos (4 Required)</h4>
            </div>
            <div className="space-y-4">
              {heroVideos.map((video, index) => (
                <div key={index} className="border border-slate-600 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-medium">{video.name}</p>
                      <p className="text-xs text-slate-400 truncate">{video.url}</p>
                    </div>
                    <label className="cursor-pointer">
                      <div className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-sm font-medium">
                        {pendingVideos[index] ? "Selected ✓" : "Choose File"}
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileSelect(e, 'hero', index)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images - 3 Slots */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-pink-400" />
              <h4 className="font-semibold text-lg">Home Gallery Images (3 Required)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {galleryImagesState.map((img, index) => (
                <div key={index} className="border border-slate-600 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    <img src={img.url} alt={img.name} className="max-h-full object-cover" />
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <p className="text-sm truncate">{img.name}</p>
                    <label className="cursor-pointer">
                      <div className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded-lg text-xs font-medium">
                        {pendingImages[index] ? "Selected ✓" : "Choose File"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'gallery', index)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6 text-center">
          You must select all 4 videos + all 3 images before saving.
        </p>
      </div>
    </div>
  );
}
