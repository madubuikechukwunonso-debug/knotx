'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, Package, Users, Calendar, TrendingUp, 
  UserPlus, ShoppingCart, Clock, RefreshCw 
} from 'lucide-react';

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
  lastUpdated: string;
}

export default function AdminOverviewSection() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/overview', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastUpdated(new Date().toLocaleTimeString());
      }
    } catch (error) {
      console.error('Failed to fetch overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // Initial fetch

    const interval = setInterval(() => {
      fetchData();
    }, 12000); // Poll every 12 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!data) return null;

  const { stats, recentUsers, recentOrders, recentBookings } = data;

  const statsCards = [
    { title: "Total Revenue", value: `$${(stats.revenue / 100).toFixed(2)}`, change: "+18%", icon: DollarSign },
    { title: "Total Orders", value: stats.orders.toString(), change: "+12%", icon: Package },
    { title: "Registered Users", value: stats.customers.toString(), change: "+8%", icon: Users },
    { title: "Total Bookings", value: stats.bookings.toString(), change: "+5%", icon: Calendar },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif text-white">Overview</h1>
          <p className="text-zinc-400">Real-time business insights</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
          <RefreshCw className="h-3 w-3" />
          Last updated: {lastUpdated || 'Just now'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-zinc-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-4xl font-semibold text-white mt-3 tracking-tighter">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-zinc-800 rounded-2xl flex items-center justify-center">
                  <Icon className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-6 text-emerald-400 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change} this month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVITY CONSOLE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <h2 className="font-medium text-white text-xl">Activity Console</h2>
            </div>
            <span className="text-[10px] px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono tracking-widest">LIVE</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono">Auto-refreshing every 12s</div>
        </div>

        <div className="p-6 space-y-8 max-h-[580px] overflow-auto">
          {/* Registered Users */}
          {recentUsers.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm font-medium tracking-widest">NEW REGISTRATIONS</span>
              </div>
              <div className="space-y-3">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4">
                    <div>
                      <p className="font-medium text-white">{user.displayName || 'Unnamed User'}</p>
                      <p className="text-sm text-zinc-400">{user.email}</p>
                    </div>
                    <div className="text-right text-xs text-zinc-500 font-mono">
                      {new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Orders */}
          {recentOrders.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium tracking-widest">RECENT ORDERS</span>
              </div>
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4">
                    <div>
                      <p className="font-medium text-white">{order.customerName}</p>
                      <p className="text-sm text-zinc-400">{order.customerEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${(order.total / 100).toFixed(2)}</p>
                      <p className="text-xs text-zinc-500 font-mono">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Bookings */}
          {recentBookings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium tracking-widest">RECENT BOOKINGS</span>
              </div>
              <div className="space-y-3">
                {recentBookings.map((booking: any) => (
                  <div key={booking.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4">
                    <div>
                      <p className="font-medium text-white">{booking.customerName}</p>
                      <p className="text-sm text-zinc-400">{booking.serviceType}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white">${(booking.price / 100).toFixed(2)}</p>
                      <p className="text-xs text-zinc-500 font-mono">{booking.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
