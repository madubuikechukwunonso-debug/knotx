// src/sections/admin/AdminOverviewSection.tsx
import { PrismaClient } from '@prisma/client';
import { DollarSign, Package, Users, Calendar, TrendingUp } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminOverviewSection() {
  // === REAL DATABASE QUERIES ===
  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
  });

  const totalOrders = await prisma.order.count();
  const totalCustomers = await prisma.localUser.count();
  const totalBookings = await prisma.booking.count();

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      customerName: true,
      total: true,
      status: true,
      createdAt: true,
    },
  });

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      customerName: true,
      serviceType: true,
      price: true,
      status: true,
      createdAt: true,
    },
  });

  const stats = [
    {
      title: "Revenue",
      value: `$${(totalRevenue._sum.total || 0) / 100}`,
      change: "+18%",
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: totalOrders.toString(),
      change: "+12%",
      icon: Package,
    },
    {
      title: "Customers",
      value: totalCustomers.toString(),
      change: "-3%",
      icon: Users,
    },
    {
      title: "Bookings",
      value: totalBookings.toString(),
      change: "+5%",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* STATS GRID - Mobile-first */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-4xl font-semibold text-emerald-950 mt-2 tracking-tighter">
                    {stat.value}
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Icon className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-6 text-emerald-600 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>{stat.change} this month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-emerald-100">
        <h2 className="font-medium text-emerald-950 text-xl mb-5 flex items-center gap-2">
          <span>Recent Activity</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-3xl">Live</span>
        </h2>

        <div className="space-y-5">
          {/* Recent Orders */}
          {recentOrders.map((order) => (
            <div key={`order-${order.id}`} className="flex justify-between items-center py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-emerald-600">
                  <Package size={20} />
                </div>
                <div>
                  <p className="font-medium text-emerald-950">{order.customerName}</p>
                  <p className="text-xs text-emerald-500">Order #{order.id}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-950">${(order.total / 100).toFixed(2)}</p>
                <p className="text-xs uppercase tracking-widest text-emerald-600">{order.status}</p>
              </div>
            </div>
          ))}

          {/* Recent Bookings */}
          {recentBookings.map((booking) => (
            <div key={`booking-${booking.id}`} className="flex justify-between items-center py-3 border-b last:border-0">
              <div className="flex items-center gap-3">
                <div className="text-emerald-600">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="font-medium text-emerald-950">{booking.customerName}</p>
                  <p className="text-xs text-emerald-500">{booking.serviceType}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-emerald-950">${(booking.price / 100).toFixed(2)}</p>
                <p className="text-xs uppercase tracking-widest text-emerald-600">{booking.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick note if no data yet */}
      {(recentOrders.length === 0 && recentBookings.length === 0) && (
        <p className="text-center text-emerald-500 py-8">
          No activity yet — your first orders and bookings will appear here.
        </p>
      )}
    </div>
  );
}
