'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, Package, Users, Calendar, TrendingUp, 
  UserPlus, ShoppingCart, RefreshCw, MapPin 
} from 'lucide-react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

interface OverviewData {
  stats: {
    revenue: number;
    orders: number;
    customers: number;
    bookings: number;
  };
  recentUsers: any[];
  recentOrders: any[];
  recentBookings: any[];
}

export default function AdminOverviewSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/overview', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error('Failed to fetch overview data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return <div className="flex h-96 items-center justify-center text-zinc-400">Loading dashboard...</div>;
  }

  if (!data) return null;

  const { stats, recentUsers, recentOrders, recentBookings } = data;

  // Demo locations for the map (you can replace with real IP data later)
  const activeLocations = [
    { name: "Toronto", coordinates: [-79.3832, 43.6532] },
    { name: "New York", coordinates: [-74.0060, 40.7128] },
    { name: "London", coordinates: [-0.1276, 51.5074] },
    { name: "Dubai", coordinates: [55.2708, 25.2048] },
    { name: "Lagos", coordinates: [3.3792, 6.5244] },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-serif text-white tracking-tight">Command Center</h1>
          <p className="text-zinc-400 mt-2">Real-time overview of your business</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-emerald-400">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: "Revenue", value: `$${(stats.revenue / 100).toFixed(2)}`, icon: DollarSign },
          { title: "Orders", value: stats.orders, icon: Package },
          { title: "Users", value: stats.customers, icon: Users },
          { title: "Bookings", value: stats.bookings, icon: Calendar },
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 text-sm">{stat.title}</p>
                <p className="text-4xl font-semibold text-white mt-2 tracking-tighter">{stat.value}</p>
              </div>
              <stat.icon className="h-8 w-8 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* WORLD MAP + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* WORLD MAP CARD */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-medium text-white">Active Users Worldwide</h2>
            </div>
            <span className="text-xs text-emerald-400 font-mono">LIVE</span>
          </div>

          <div className="relative bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800">
            <ComposableMap
              projectionConfig={{ scale: 140 }}
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
                      fill="#27272a"
                      stroke="#3f3f46"
                      strokeWidth={0.5}
                    />
                  ))
                }
              </Geographies>

              {/* Glowing dots for active users */}
              {activeLocations.map((location, index) => (
                <Marker key={index} coordinates={location.coordinates as [number, number]}>
                  <g>
                    {/* Outer glow */}
                    <circle r={12} fill="#10b981" opacity="0.15" />
                    {/* Inner dot */}
                    <circle r={5} fill="#10b981" />
                    {/* Pulse animation */}
                    <circle r={5} fill="#10b981" opacity="0.6">
                      <animate attributeName="r" values="5;14;5" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>

          <p className="text-center text-xs text-zinc-500 mt-4">
            Real-time active users by location
          </p>
        </div>

        {/* ACTIVITY CONSOLE */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <h2 className="font-medium text-white flex items-center gap-2">
              Activity Feed <span className="text-emerald-400 text-xs">LIVE</span>
            </h2>
            <RefreshCw className="h-4 w-4 text-zinc-400" />
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-auto text-sm">
            {/* Recent Users */}
            {recentUsers.length > 0 && (
              <div>
                <p className="text-emerald-400 text-xs tracking-widest mb-3">NEW USERS</p>
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-white">{user.displayName || 'New User'}</p>
                      <p className="text-zinc-400 text-xs">{user.email}</p>
                    </div>
                    <span className="text-zinc-500 text-xs font-mono self-center">
                      {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Orders */}
            {recentOrders.length > 0 && (
              <div>
                <p className="text-emerald-400 text-xs tracking-widest mb-3 mt-4">RECENT ORDERS</p>
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-white">{order.customerName}</p>
                      <p className="text-zinc-400 text-xs">Order #{order.id}</p>
                    </div>
                    <span className="text-emerald-400 font-medium self-center">
                      ${(order.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Recent Bookings */}
            {recentBookings.length > 0 && (
              <div>
                <p className="text-emerald-400 text-xs tracking-widest mb-3 mt-4">RECENT BOOKINGS</p>
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-white">{booking.customerName}</p>
                      <p className="text-zinc-400 text-xs">{booking.serviceType}</p>
                    </div>
                    <span className="text-emerald-400 font-medium self-center">
                      ${(booking.price / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
