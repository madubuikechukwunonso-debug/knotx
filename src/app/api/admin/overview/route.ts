// src/app/api/admin/overview/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

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
      liveVisitors,
    ] = await Promise.all([
      // Total Revenue (Orders + Bookings)
      prisma.order.aggregate({ _sum: { total: true } }),

      // Revenue from Orders only
      prisma.order.aggregate({ _sum: { total: true } }),

      // Revenue from Bookings
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

      // ============================================
      // LIVE VISITORS (Last 15 minutes)
      // ============================================
      prisma.visitorLog.findMany({
        where: {
          createdAt: {
            gte: fifteenMinutesAgo,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 20,
        select: {
          id: true,
          ip: true,
          page: true,
          userType: true,
          displayName: true,
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
      liveVisitors, // ← Now populated with real data
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
