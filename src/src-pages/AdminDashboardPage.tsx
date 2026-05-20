'use client';

import { useState, useEffect } from 'react';
import {
  Users, DollarSign, ShoppingCart, Calendar, RefreshCw, MapPin, Upload, Video, Image as ImageIcon
} from 'lucide-react';
import { put } from '@vercel/blob';

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
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [uploading, setUploading] = useState(false);

  async function fetchData(isManual = false) {
    if (!isManual) setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setData(json);
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

  // === MEDIA UPLOAD HANDLERS ===
  const handleHeroVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const blob = await put(`hero/${file.name}`, file, {
        access: 'public',
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      });

      // TODO: Save blob.url to database or env (for now just alert)
      alert(`Hero video uploaded successfully!\nURL: ${blob.url}\n\nUpdate HeroSection.tsx to use this URL.`);
      console.log('New Hero Video URL:', blob.url);
    } catch (error) {
      alert('Upload failed');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const blob = await put(`gallery/${file.name}`, file, {
        access: 'public',
        token: process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN,
      });

      alert(`Gallery image uploaded!\nURL: ${blob.url}\n\nYou can now add this to HomeGallerySection.tsx`);
      console.log('New Gallery Image URL:', blob.url);
    } catch (error) {
      alert('Upload failed');
      console.error(error);
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

      {/* === STATS WITH REVENUE BREAKDOWN === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue Card */}
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
            <p className="text-[10px] text-slate-500 pt-2">
              Revenue = Completed Orders + Paid Booking Deposits
            </p>
          </div>
        </div>

        {/* Other Stats */}
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

      {/* Live Visitors + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Live Visitors Console */}
        <div className="lg:col-span-3 bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-pink-400 text-xs tracking-[3px]">LIVE VISITORS</p>
              <p className="text-xl font-medium">Website Activity</p>
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
                    <p className="font-medium">{visitor.displayName || 'Guest'}</p>
                    <p className="text-xs text-slate-400">{visitor.page}</p>
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
                No live visitors tracked yet.<br />
                <span className="text-xs">(Visitor tracking needs to be implemented)</span>
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
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

      {/* === FUNCTIONAL MEDIA MANAGEMENT === */}
      <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Upload className="text-pink-400" /> Media Management
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Current videos and images will remain as placeholders until you upload new ones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hero Video Upload */}
          <div className="border border-slate-600 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Video className="text-pink-400" />
              <div>
                <p className="font-medium">Hero Section Video</p>
                <p className="text-xs text-slate-400">Current video stays until replaced</p>
              </div>
            </div>
            <label className="cursor-pointer">
              <div className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-center text-sm font-medium">
                {uploading ? "Uploading..." : "Upload New Hero Video"}
              </div>
              <input 
                type="file" 
                accept="video/*" 
                onChange={handleHeroVideoUpload} 
                className="hidden" 
                disabled={uploading}
              />
            </label>
          </div>

          {/* Gallery Image Upload */}
          <div className="border border-slate-600 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-pink-400" />
              <div>
                <p className="font-medium">Home Gallery Images</p>
                <p className="text-xs text-slate-400">Current images stay until replaced</p>
              </div>
            </div>
            <label className="cursor-pointer">
              <div className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-center text-sm font-medium">
                {uploading ? "Uploading..." : "Upload New Gallery Image"}
              </div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleGalleryImageUpload} 
                className="hidden" 
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
