import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalBookings,
      recentUsers,
      recentOrders,
      recentBookings,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.count(),
      prisma.localUser.count(),
      prisma.booking.count(),
      prisma.localUser.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        select: { id: true, displayName: true, email: true, createdAt: true },
      }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, customerName: true, customerEmail: true, total: true, status: true, createdAt: true },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, customerName: true, customerEmail: true, serviceType: true, price: true, status: true, createdAt: true },
      }),
    ]);

    return NextResponse.json({
      stats: {
        revenue: totalRevenue._sum.total || 0,
        orders: totalOrders,
        customers: totalCustomers,
        bookings: totalBookings,
      },
      recentUsers,
      recentOrders,
      recentBookings,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Overview API error:', error);
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 });
  }
}
