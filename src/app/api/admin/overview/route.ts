import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalRevenue,
      revenueFromOrders,
      revenueFromBookings,
      totalOrders,
      totalCustomers,
      totalBookings,
      recentUsers,
      recentOrders,
      recentBookings,
    ] = await Promise.all([
      // Total Revenue (Orders + Bookings)
      prisma.order.aggregate({ _sum: { total: true } }),

      // Revenue from Orders only
      prisma.order.aggregate({ _sum: { total: true } }),

      // Revenue from Bookings (using price field)
      prisma.booking.aggregate({ _sum: { price: true } }),

      prisma.order.count(),
      prisma.localUser.count(),
      prisma.booking.count(),

      // Recent Users
      prisma.localUser.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayName: true,
          email: true,
          createdAt: true,
        },
      }),

      // Recent Orders
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          customerName: true,
          total: true,
          status: true,
          createdAt: true,
        },
      }),

      // Recent Bookings
      prisma.booking.findMany({
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
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalRevenue: (totalRevenue._sum.total || 0) + (revenueFromBookings._sum.price || 0),
        totalOrders,
        totalCustomers,
        totalBookings,
        revenueFromOrders: revenueFromOrders._sum.total || 0,
        revenueFromBookings: revenueFromBookings._sum.price || 0,
      },
      recentUsers,
      recentOrders,
      recentBookings,
      liveVisitors: [], // Placeholder for future visitor tracking
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overview data' },
      { status: 500 }
    );
  }
}
