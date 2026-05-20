'use client';

import { useState, useEffect } from 'react';
import { 
  Users, DollarSign, ShoppingCart, Calendar, RefreshCw, MapPin 
} from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

interface OverviewData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalBookings: number;
  };
  recentUsers: any[];
  recentOrders: any[];
  recentBookings: any[];
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
    const interval = setInterval(() => fetchData(), 12000);
    return () => clearInterval(interval);
  }, []);

  // DEBUG LOG - Check your browser console (F12)
  console.log('%c[AdminOverview] 🔥 v5.0 COMPLETELY NEW DESIGN LOADED', 'color: #22d3ee; font-size: 13px; font-weight: bold');

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

  const activeLocations = [
    { name: 'Toronto', coordinates: [-79.3832, 43.6532] as [number, number] },
    { name: 'New York', coordinates: [-74.0060, 40.7128] as [number, number] },
    { name: 'London', coordinates: [-0.1276, 51.5074] as [number, number] },
    { name: 'Dubai', coordinates: [55.2708, 25.2048] as [number, number] },
    { name: 'Lagos', coordinates: [3.3792, 6.5244] as [number, number] },
  ];

  return (
    <div className="space-y-8 bg-[#0f172a] min-h-screen p-6 text-white">
      
      {/* === SUPER OBVIOUS VERSION BADGE === */}
      <div className="bg-[#1e2937] border border-cyan-500/30 rounded-2xl p-4 text-center">
        <div className="inline-flex items-center gap-3 bg-cyan-500/10 px-6 py-2 rounded-full">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
          <span className="font-mono text-cyan-400 text-sm tracking-[4px]">VERSION 5.0 — NEW DESIGN</span>
        </div>
        <p className="text-xs text-cyan-400/60 mt-2">If you see this cyan banner, the new code is running</p>
      </div>

      <div>
        <h1 className="text-4xl font-semibold tracking-tight">Command Center</h1>
        <p className="text-slate-400 mt-1">Real-time overview • KnotX &amp; Krafts</p>
      </div>

      {/* Stats Row - Different Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Revenue", value: data ? `$${(data.stats.totalRevenue / 100).toFixed(0)}` : "—", icon: DollarSign },
          { label: "Orders", value: data?.stats.totalOrders ?? "—", icon: ShoppingCart },
          { label: "Customers", value: data?.stats.totalCustomers ?? "—", icon: Users },
          { label: "Bookings", value: data?.stats.totalBookings ?? "—", icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1e2937] border border-slate-700 rounded-2xl p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-slate-400 tracking-widest">{stat.label}</p>
                <p className="text-3xl font-semibold mt-3 tabular-nums text-white">
                  {loading && !data ? "..." : stat.value}
                </p>
              </div>
              <stat.icon className="text-cyan-400 mt-1" size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* World Map - Different Container Style */}
        <div className="lg:col-span-3 bg-[#1e2937] border border-slate-700 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <MapPin className="text-cyan-400" />
            <div>
              <p className="text-cyan-400 text-xs tracking-[3px]">GLOBAL ACTIVITY</p>
              <p className="text-xl font-medium">Live User Locations</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-[#0f172a]">
            <ComposableMap
              projectionConfig={{ scale: 135 }}
              width={800}
              height={400}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#334155"
                      stroke="#475569"
                      strokeWidth={0.5}
                    />
                  ))
                }
              </Geographies>

              {activeLocations.map((loc, index) => (
                <Marker key={index} coordinates={loc.coordinates}>
                  <g>
                    <circle r={5} fill="#22d3ee" />
                    <circle r={5} fill="#22d3ee" opacity="0.4">
                      <animate attributeName="r" values="5;16;5" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>
        </div>

        {/* Activity Console - Different Style */}
        <div className="lg:col-span-2 bg-[#1e2937] border border-slate-700 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-cyan-400 text-xs tracking-[3px]">LIVE FEED</p>
              <p className="text-xl font-medium">Activity Console</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              {lastUpdated && (
                <div className="text-right">
                  <div className="text-slate-400 text-[10px]">Updated</div>
                  <div className="font-mono text-cyan-400">{formatTime(lastUpdated)}</div>
                </div>
              )}
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-sm transition-all"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-6 text-sm overflow-auto">
            {/* Recent Users */}
            <div>
              <p className="text-cyan-400 text-xs mb-3 tracking-widest">NEW USERS</p>
              {data?.recentUsers?.length ? (
                data.recentUsers.map((user: any) => (
                  <div key={user.id} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p>{user.displayName || "New User"}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <span className="text-xs text-cyan-400 self-center">
                      {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : <p className="text-slate-400 text-xs">No recent users</p>}
            </div>

            {/* Recent Orders */}
            <div>
              <p className="text-cyan-400 text-xs mb-3 tracking-widest">RECENT ORDERS</p>
              {data?.recentOrders?.length ? (
                data.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p>{order.customerName}</p>
                      <p className="text-xs text-slate-400">#{order.id}</p>
                    </div>
                    <span className="text-cyan-400 font-medium">
                      ${(order.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : <p className="text-slate-400 text-xs">No recent orders</p>}
            </div>

            {/* Recent Bookings */}
            <div>
              <p className="text-cyan-400 text-xs mb-3 tracking-widest">BOOKINGS</p>
              {data?.recentBookings?.length ? (
                data.recentBookings.map((b: any) => (
                  <div key={b.id} className="flex justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p>{b.customerName}</p>
                      <p className="text-xs text-slate-400">{b.serviceType}</p>
                    </div>
                    <span className="text-cyan-400 font-medium">
                      ${(b.price / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : <p className="text-slate-400 text-xs">No recent bookings</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
