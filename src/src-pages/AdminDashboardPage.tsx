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

  // Save Videos (with overwrite)
  const handleSaveVideos = async () => {
    const hasAllVideos = pendingVideos.every(f => f !== null);
    if (!hasAllVideos) {
      alert("Please select all 4 videos before saving.");
      return;
    }

    setUploading(true);
    try {
      // 1. Delete old videos
      await fetch('/api/admin/media/clear?type=hero', { method: 'DELETE' });

      // 2. Upload new videos
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

      alert("All 4 Hero Videos saved successfully! (Old ones replaced)");
      setPendingVideos([null, null, null, null]);
      await fetchData(true);
    } catch (error) {
      alert("Failed to save videos.");
    } finally {
      setUploading(false);
    }
  };

  // Save Images (with overwrite)
  const handleSaveImages = async () => {
    const hasAllImages = pendingImages.every(f => f !== null);
    if (!hasAllImages) {
      alert("Please select all 3 images before saving.");
      return;
    }

    setUploading(true);
    try {
      // 1. Delete old images
      await fetch('/api/admin/media/clear?type=gallery', { method: 'DELETE' });

      // 2. Upload new images
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

      alert("All 3 Gallery Images saved successfully! (Old ones replaced)");
      setPendingImages([null, null, null]);
      await fetchData(true);
    } catch (error) {
      alert("Failed to save images.");
    } finally {
      setUploading(false);
    }
  };

  const canSaveVideos = pendingVideos.every(f => f !== null);
  const canSaveImages = pendingImages.every(f => f !== null);

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

      {/* Stats + Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 tracking-widest">TOTAL REVENUE</p>
              <p className="text-4xl font-semibold tabular-nums mt-1">
                {loading && !data ? "..." : `$${(data?.stats.totalRevenue || 0) / 100}`}
              </p>
            </div>
            <DollarSign className="text-pink-400" size={28} />
          </div>
          <div className="mt-4 space-y-2 text-sm border-t border-slate-700 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-400">From Orders</span>
              <span className="font-medium">${(data?.stats.revenueFromOrders || 0) / 100}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">From Booking Deposits</span>
              <span className="font-medium">${(data?.stats.revenueFromBookings || 0) / 100}</span>
            </div>
          </div>
        </div>

        {[
          { label: "Total Orders", value: data?.stats.totalOrders ?? "—", icon: ShoppingCart },
          { label: "Customers", value: data?.stats.totalCustomers ?? "—", icon: Users },
          { label: "Bookings", value: data?.stats.totalBookings ?? "—", icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 tracking-widest">{stat.label}</p>
                <p className="text-4xl font-semibold mt-3 tabular-nums">
                  {loading && !data ? "..." : stat.value}
                </p>
              </div>
              <stat.icon className="text-pink-400 mt-1" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Live Visitors + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-pink-400 text-xs tracking-[3px]">LIVE VISITORS</p>
              <p className="text-xl font-medium">Website Activity Log</p>
            </div>
            <button onClick={() => fetchData(true)} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="max-h-[380px] overflow-auto pr-2 space-y-3 text-sm">
            {data?.liveVisitors && data.liveVisitors.length > 0 ? (
              data.liveVisitors.map((visitor, index) => (
                <div key={index} className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl">
                  <div>
                    <p className="font-medium">{visitor.displayName || 'Guest Visitor'}</p>
                    <p className="text-xs text-slate-400">{visitor.page} • {visitor.ip}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${visitor.userType === 'registered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20'}`}>
                      {visitor.userType}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-slate-400 text-sm">
                No live visitors logged yet.<br />
                <span className="text-xs">(Tracking is active via middleware)</span>
              </p>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
          <p className="text-pink-400 text-xs tracking-[3px] mb-4">RECENT ACTIVITY</p>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 mb-2">NEW USERS</p>
              {data?.recentUsers?.length ? data.recentUsers.map((u, i) => (
                <div key={i} className="flex justify-between py-1 border-b border-slate-700 last:border-0">
                  <span>{u.displayName || u.email}</span>
                </div>
              )) : <p className="text-xs text-slate-500">No recent users</p>}
            </div>
          </div>
        </div>
      </div>

      {/* === MEDIA MANAGEMENT (TWO SEPARATE SAVE BUTTONS + OVERWRITE) === */}
      <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Upload className="text-pink-400" /> Media Management
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Hero Videos */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Video className="text-pink-400" />
                <h4 className="font-semibold text-lg">Hero Section Videos (4 Required)</h4>
              </div>
              <button
                onClick={handleSaveVideos}
                disabled={!canSaveVideos || uploading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all"
              >
                {uploading ? "Saving..." : "Save All Videos"}
              </button>
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

          {/* Gallery Images */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="text-pink-400" />
                <h4 className="font-semibold text-lg">Home Gallery Images (3 Required)</h4>
              </div>
              <button
                onClick={handleSaveImages}
                disabled={!canSaveImages || uploading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl text-sm font-medium transition-all"
              >
                {uploading ? "Saving..." : "Save All Images"}
              </button>
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
          Uploading a new set will replace the previous one.
        </p>
      </div>
    </div>
  );
}
