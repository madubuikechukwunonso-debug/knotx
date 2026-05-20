'use client';

import { useState, useEffect } from 'react';
import {
  Users, DollarSign, ShoppingCart, Calendar, RefreshCw, Upload, Video, Image as ImageIcon
} from 'lucide-react';
import { put } from '@vercel/blob';
import { galleryImages } from '@/lib/galleryImages';

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

  // Default 4 Hero Videos
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

      // Merge Hero Videos
      const dbVideos = mediaData.heroVideos || [];
      const mergedVideos = defaultVideos.map((defaultVideo, index) => {
        const dbVideo = dbVideos[index];
        return dbVideo
          ? { id: dbVideo.id, url: dbVideo.url, name: dbVideo.name || defaultVideo.name }
          : defaultVideo;
      });
      setHeroVideos(mergedVideos);

      // Use real gallery images from lib/galleryImages.ts
      const realGallery = galleryImages.slice(0, 3).map((img, index) => ({
        id: img.id,
        url: img.src,
        name: img.alt || `Gallery Image ${index + 1}`,
      }));

      // Merge with DB uploads (if any)
      const dbImages = mediaData.galleryImages || [];
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

  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await put(`hero/${file.name}`, file, {
        access: 'public',
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      });
      await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'hero', url: blob.url, name: file.name }),
      });
      alert(`Hero Video ${index + 1} updated successfully!`);
      await fetchData(true);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const blob = await put(`gallery/${file.name}`, file, {
        access: 'public',
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      });
      await fetch('/api/admin/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'gallery', url: blob.url, name: file.name }),
      });
      alert(`Gallery Image ${index + 1} updated successfully!`);
      await fetchData(true);
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

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

      {/* === MEDIA MANAGEMENT === */}
      <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <Upload className="text-pink-400" /> Media Management
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Hero Videos - 4 Fixed Slots with Preview */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Video className="text-pink-400" />
              <h4 className="font-semibold text-lg">Hero Section Videos (4 Slots)</h4>
            </div>
            <div className="space-y-4">
              {heroVideos.map((video, index) => (
                <div key={index} className="border border-slate-600 rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <p className="font-medium truncate">{video.name}</p>
                      <p className="text-xs text-slate-400 truncate">{video.url}</p>
                    </div>
                    <label className="cursor-pointer ml-3 flex-shrink-0">
                      <div className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-xl text-sm font-medium whitespace-nowrap">
                        Change
                      </div>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleHeroVideoUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  
                  {/* Video Preview */}
                  <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-video">
                    <video 
                      src={video.url} 
                      className="w-full h-full object-cover" 
                      muted 
                      loop 
                      autoPlay 
                      playsInline
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Images - 3 Slots with Preview */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-pink-400" />
              <h4 className="font-semibold text-lg">Home Gallery Images (3 Slots)</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {galleryImages.map((img, index) => (
                <div key={index} className="border border-slate-600 rounded-2xl overflow-hidden">
                  <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    <img 
                      src={img.url} 
                      alt={img.name} 
                      className="max-h-full object-cover" 
                    />
                  </div>
                  <div className="p-3 flex justify-between items-center">
                    <p className="text-sm truncate">{img.name}</p>
                    <label className="cursor-pointer">
                      <div className="px-3 py-1 bg-pink-600 hover:bg-pink-700 rounded-lg text-xs font-medium">
                        Change
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleGalleryImageUpload(e, index)}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-500 mt-6 text-center">
          Default assets from public folder will be used until replaced.
        </p>
      </div>
    </div>
  );
}
