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
  recentUsers: Array<{
    id: number;
    displayName: string | null;
    email: string;
    createdAt: string;
  }>;
  recentOrders: Array<{
    id: number;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  recentBookings: Array<{
    id: number;
    customerName: string;
    serviceType: string;
    price: number;
    status: string;
    createdAt: string;
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
      console.error('Overview fetch error:', error);
    } finally {
      if (!isManual) setLoading(false);
    }
  }

  // Initial load + auto-refresh every 12 seconds
  useEffect(() => {
    fetchData();
    
    const interval = setInterval(() => {
      fetchData();
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Demo active locations (you can later replace with real IP geolocation)
  const activeLocations = [
    { name: "Toronto", coordinates: [-79.3832, 43.6532] as [number, number] },
    { name: "New York", coordinates: [-74.0060, 40.7128] as [number, number] },
    { name: "London", coordinates: [-0.1276, 51.5074] as [number, number] },
    { name: "Dubai", coordinates: [55.2708, 25.2048] as [number, number] },
    { name: "Lagos", coordinates: [3.3792, 6.5244] as [number, number] },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Overview</h1>
        <p className="text-zinc-400 mt-1">Real-time command center for KnotX &amp; Krafts</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: data ? `$${(data.stats.totalRevenue / 100).toFixed(0)}` : "—", icon: DollarSign, color: "emerald" },
          { label: "Orders", value: data?.stats.totalOrders ?? "—", icon: ShoppingCart, color: "emerald" },
          { label: "Customers", value: data?.stats.totalCustomers ?? "—", icon: Users, color: "emerald" },
          { label: "Bookings", value: data?.stats.totalBookings ?? "—", icon: Calendar, color: "emerald" },
        ].map((stat, index) => (
          <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[2px] text-zinc-500">{stat.label}</p>
                <p className="text-4xl font-semibold text-white mt-2 tabular-nums">
                  {loading && !data ? "..." : stat.value}
                </p>
              </div>
              <div className="text-emerald-400/80">
                <stat.icon size={28} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: World Map + Activity Console */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* World Map Card */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 overflow-hidden">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-emerald-400" size={20} />
            <div>
              <p className="text-emerald-400 text-xs tracking-[3px] font-mono">GLOBAL REACH</p>
              <p className="text-white text-lg font-medium">Active User Locations</p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800">
            <ComposableMap
              projectionConfig={{ scale: 140 }}
              width={800}
              height={420}
              style={{ width: "100%", height: "auto", backgroundColor: "#18181b" }}
            >
              <Geographies geography="https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json">
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#27272a"
                      stroke="#3f3f46"
                      strokeWidth={0.6}
                    />
                  ))
                }
              </Geographies>

              {activeLocations.map((location, index) => (
                <Marker key={index} coordinates={location.coordinates}>
                  <g>
                    {/* Outer glow */}
                    <circle r={14} fill="#10b981" opacity="0.15" />
                    {/* Core dot */}
                    <circle r={6} fill="#10b981" />
                    {/* Pulsing ring */}
                    <circle r={6} fill="#10b981" opacity="0.7">
                      <animate attributeName="r" values="6;18;6" dur="2.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  </g>
                </Marker>
              ))}
            </ComposableMap>
          </div>
          <p className="text-[10px] text-zinc-500 mt-3 text-center tracking-widest">DEMO LOCATIONS • LIVE USERS</p>
        </div>

        {/* Activity Console */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
              <div>
                <p className="text-emerald-400 text-xs tracking-[3px] font-mono">LIVE ACTIVITY CONSOLE</p>
                <p className="text-white text-lg font-medium -mt-0.5">Real-time Feed</p>
              </div>
            </div>

            {/* NEW: Last Updated + Refresh Button */}
            <div className="flex items-center gap-3 text-xs">
              {lastUpdated && (
                <div className="text-right">
                  <div className="text-zinc-500">Last updated</div>
                  <div className="font-mono text-emerald-400 tabular-nums">
                    {formatTime(lastUpdated)}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => fetchData(true)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-700 hover:bg-zinc-800 active:bg-zinc-950 transition-all disabled:opacity-60 text-sm"
              >
                <RefreshCw 
                  size={16} 
                  className={loading ? "animate-spin" : ""} 
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Activity Content */}
          <div className="flex-1 space-y-6 overflow-auto pr-1 text-sm">
            {/* Recent Users */}
            <div>
              <p className="text-emerald-400 text-xs tracking-widest mb-3">NEW REGISTRATIONS</p>
              {data?.recentUsers.length ? (
                data.recentUsers.map((user) => (
                  <div key={user.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-white">{user.displayName || "New User"}</p>
                      <p className="text-zinc-500 text-xs">{user.email}</p>
                    </div>
                    <span className="text-emerald-400 text-xs self-center tabular-nums">
                      {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-xs py-2">No recent registrations</p>
              )}
            </div>

            {/* Recent Orders */}
            <div>
              <p className="text-emerald-400 text-xs tracking-widest mb-3">RECENT ORDERS</p>
              {data?.recentOrders.length ? (
                data.recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-white">{order.customerName}</p>
                      <p className="text-zinc-500 text-xs">Order #{order.id} • {order.status}</p>
                    </div>
                    <span className="text-emerald-400 font-medium self-center tabular-nums">
                      ${(order.total / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-xs py-2">No recent orders</p>
              )}
            </div>

            {/* Recent Bookings */}
            <div>
              <p className="text-emerald-400 text-xs tracking-widest mb-3">RECENT BOOKINGS</p>
              {data?.recentBookings.length ? (
                data.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between py-2 border-b border-zinc-800 last:border-0">
                    <div>
                      <p className="text-white">{booking.customerName}</p>
                      <p className="text-zinc-500 text-xs">{booking.serviceType} • {booking.status}</p>
                    </div>
                    <span className="text-emerald-400 font-medium self-center tabular-nums">
                      ${(booking.price / 100).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-xs py-2">No recent bookings</p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-auto border-t border-zinc-800 text-[10px] text-zinc-500 text-center tracking-widest">
            Auto-refreshes every 12s • Manual refresh available above
          </div>
        </div>
      </div>
    </div>
  );
}
