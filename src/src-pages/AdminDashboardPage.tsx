'use client';

import { useState, useEffect } from 'react';
import {
  Users, DollarSign, ShoppingCart, Calendar, RefreshCw, MapPin, Upload, Image as ImageIcon, Video
} from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

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
  liveVisitors?: Array<{
    id: string;
    ip: string;
    page: string;
    userType: 'registered' | 'guest';
    displayName?: string;
    timestamp: string;
    country?: string;
    city?: string;
    coordinates?: [number, number];
  }>;
}

export default function AdminOverviewSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function fetchData(isManual = false) {
    if (!isManual) setLoading(true);
    try {
      const res = await fetch('/api/admin/overview', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Failed to fetch overview data');
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

  console.log('%c[AdminOverview] ✅ VERSION 7 - FINAL UPDATED DESIGN LOADED', 'color: #f472b6; font-size: 13px');

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-CA', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  // Use real visitor locations if available, otherwise empty
  const visitorLocations = data?.liveVisitors?.filter(v => v.coordinates) || [];

  return (
    <div className="space-y-8 bg-[#0f172a] min-h-screen p-6 text-white">
      
      {/* Version Badge */}
      <div className="bg-[#1e2937] border border-pink-500/30 rounded-2xl p-4 text-center">
        <div className="inline-flex items-center gap-3 bg-pink-500/10 px-6 py-2 rounded-full">
          <div className="w-3 h-3 bg-pink-400 rounded-full animate-pulse" />
          <span className="font-mono text-pink-400 text-sm tracking-[4px]">VERSION 7 — FINAL</span>
        </div>
      </div>

      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-slate-400 mt-1">Real-time business overview • KnotX &amp; Krafts</p>
      </div>

      {/* === STATS WITH REVENUE BREAKDOWN === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue Card with Rundown */}
        <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-6 col-span-1 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 tracking-widest">TOTAL REVENUE</p>
              <p className="text-4xl font-semibold tabular-nums mt-1">
                {loading && !data ? "..." : `$${(data?.stats.totalRevenue || 0) / 100}`}
              </p>
            </div>
            <DollarSign className="text-pink-400" size={28} />
          </div>

          {/* Revenue Breakdown */}
          <div className="mt-4 space-y-2 text-sm border-t border-slate-700 pt-4">
            <div className="flex justify-between">
              <span className="text-slate-400">From Orders</span>
              <span className="font-medium text-white">
                ${(data?.stats.revenueFromOrders || 0) / 100}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">From Booking Deposits</span>
              <span className="font-medium text-white">
                ${(data?.stats.revenueFromBookings || 0) / 100}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 pt-2">
              Revenue = Completed Orders + Paid Booking Deposits
            </p>
          </div>
        </div>

        {/* Other Stats */}
        {[
          { label: "Orders", value: data?.stats.totalOrders ?? "—", icon: ShoppingCart },
          { label: "Customers", value: data?.stats.totalCustomers ?? "—", icon: Users },
          { label: "Bookings", value: data?.stats.totalBookings ?? "—", icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 tracking-widest">{stat.label}</p>
                <p className="text-4xl font-semibold mt-3 tabular-nums">{loading && !data ? "..." : stat.value}</p>
              </div>
              <stat.icon className="text-pink-400 mt-1" size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* === LIVE VISITORS + ACTIVITY === */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Live Visitors Console */}
        <div className="lg:col-span-3 bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-pink-400 text-xs tracking-[3px]">LIVE VISITORS</p>
              <p className="text-xl font-medium">Website Activity Console</p>
            </div>
            <button onClick={() => fetchData(true)} className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          <div className="max-h-[380px] overflow-auto pr-2 space-y-3 text-sm">
            {data?.liveVisitors && data.liveVisitors.length > 0 ? (
              data.liveVisitors.map((visitor, index) => (
                <div key={index} className="flex justify-between items-center bg-[#0f172a] p-4 rounded-2xl border border-slate-700">
                  <div>
                    <p className="font-medium">{visitor.displayName || 'Guest Visitor'}</p>
                    <p className="text-xs text-slate-400">{visitor.page} • {visitor.ip}</p>
                  </div>
                  <div className="text-right text-xs">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${visitor.userType === 'registered' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {visitor.userType}
                    </span>
                    <p className="text-slate-400 mt-1">{new Date(visitor.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No live visitors logged yet.<br />
                <span className="text-xs">(Implement visitor tracking to populate this section)</span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
          <p className="text-pink-400 text-xs tracking-[3px] mb-4">RECENT ACTIVITY</p>
          
          <div className="space-y-5 text-sm">
            {/* Recent Users */}
            <div>
              <p className="text-xs text-slate-400 mb-2">NEW USERS</p>
              {data?.recentUsers?.length ? data.recentUsers.map((u, i) => (
                <div key={i} className="flex justify-between py-1.5 border-b border-slate-700 last:border-0">
                  <span>{u.displayName || u.email}</span>
                  <span className="text-xs text-slate-400">{new Date(u.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
              )) : <p className="text-xs text-slate-500">No recent users</p>}
            </div>

            {/* Recent Orders & Bookings */}
            <div>
              <p className="text-xs text-slate-400 mb-2">RECENT ORDERS &amp; BOOKINGS</p>
              {[...(data?.recentOrders || []), ...(data?.recentBookings || [])]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((item, i) => (
                  <div key={i} className="flex justify-between py-1.5 border-b border-slate-700 last:border-0 text-xs">
                    <span>{item.customerName}</span>
                    <span className="text-pink-400">${(item.total || item.price || 0) / 100}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* === MEDIA MANAGEMENT (Hero + Gallery) === */}
      <div className="bg-[#1e2937] border border-slate-700 rounded-3xl p-8">
        <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <Upload className="text-pink-400" /> Media Management
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Current Hero videos and Gallery images will remain as placeholders until you upload new ones.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hero Section Control */}
          <div className="border border-slate-600 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Video className="text-pink-400" />
              <div>
                <p className="font-medium">Hero Section</p>
                <p className="text-xs text-slate-400">Video Background</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Current video will stay until you upload a new one.
            </p>
            <button 
              onClick={() => alert("Hero upload modal coming soon. Current video remains as placeholder.")}
              className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-sm font-medium"
            >
              Upload New Hero Video
            </button>
          </div>

          {/* Gallery Control */}
          <div className="border border-slate-600 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ImageIcon className="text-pink-400" />
              <div>
                <p className="font-medium">Home Gallery</p>
                <p className="text-xs text-slate-400">Image Collection</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Existing images in <code>HomeGallerySection.tsx</code> will remain until replaced.
            </p>
            <button 
              onClick={() => alert("Gallery upload coming soon. Current images remain as placeholders.")}
              className="w-full py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-sm font-medium"
            >
              Manage Gallery Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
