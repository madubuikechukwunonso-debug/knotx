// src/src-pages/AdminDashboardPage.tsx
import { PrismaClient } from '@prisma/client';
import AdminStatCard from '@/components/admin/AdminStatCard';
import { Calendar, ShoppingCart, DollarSign, Users, Briefcase, Package } from 'lucide-react';

const prisma = new PrismaClient();

async function getDashboardStats() {
  const [
    totalBookings,
    totalOrders,
    revenueOrders,
    revenueBookings,
    activeServices,
    activeProducts,
    totalCustomers,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { total: true } }),
    prisma.booking.aggregate({ _sum: { price: true } }),
    prisma.service.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true } }),
    prisma.localUser.count(),
  ]);

  const totalRevenue = (revenueOrders._sum.total || 0) + (revenueBookings._sum.price || 0);

  return {
    totalBookings,
    totalOrders,
    totalRevenue,
    activeServices,
    activeProducts,
    totalCustomers,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-serif tracking-tight">Overview</h1>
        <p className="text-black/60 mt-1">Here&apos;s what&apos;s happening with your business today</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AdminStatCard
          label="Total Bookings"
          value={stats.totalBookings.toLocaleString()}
          icon={<Calendar className="h-6 w-6" />}
        />
        <AdminStatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          icon={<ShoppingCart className="h-6 w-6" />}
        />
        <AdminStatCard
          label="Total Revenue"
          value={`$${(stats.totalRevenue / 100).toLocaleString()}`}   {/* assuming cents; change /100 to /1 if whole dollars */}
          helper="CAD • All time"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <AdminStatCard
          label="Active Services"
          value={stats.activeServices.toLocaleString()}
          icon={<Briefcase className="h-6 w-6" />}
        />
        <AdminStatCard
          label="Active Products"
          value={stats.activeProducts.toLocaleString()}
          icon={<Package className="h-6 w-6" />}
        />
        <AdminStatCard
          label="Customers"
          value={stats.totalCustomers.toLocaleString()}
          icon={<Users className="h-6 w-6" />}
        />
      </div>

      {/* Future expansion area */}
      <div className="bg-white border border-black/10 rounded-3xl p-8">
        <h2 className="font-medium mb-4">Recent Activity</h2>
        <p className="text-black/50 text-sm">
          Next step: Recent bookings + orders table will go here (coming in the next tab we wire).
        </p>
      </div>
    </div>
  );
}
