// src/app/api/admin/overview/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface EnrichedVisitor {
  id: number;
  ip: string;
  page: string;
  userType: string;
  displayName: string | null;
  createdAt: Date;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

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
      rawLiveVisitors,
    ] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.order.aggregate({ _sum: { total: true } }),
      prisma.booking.aggregate({ _sum: { price: true } }),
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
        select: { id: true, customerName: true, total: true, status: true, createdAt: true },
      }),
      prisma.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, customerName: true, serviceType: true, price: true, status: true, createdAt: true },
      }),
      prisma.visitorLog.findMany({
        where: { createdAt: { gte: fifteenMinutesAgo } },
        orderBy: { createdAt: 'desc' },
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

    // Enrich visitors with real geolocation data
    const liveVisitors: EnrichedVisitor[] = await Promise.all(
      rawLiveVisitors.map(async (visitor: any) => {
        const enriched: EnrichedVisitor = { ...visitor };

        if (visitor.ip && visitor.ip !== '::1' && !visitor.ip.startsWith('127.')) {
          try {
            const geoRes = await fetch(`https://ipapi.co/${visitor.ip}/json/`, {
              next: { revalidate: 3600 },
            });

            if (geoRes.ok) {
              const geoData = await geoRes.json();

              if (geoData.latitude && geoData.longitude) {
                enriched.latitude = geoData.latitude;
                enriched.longitude = geoData.longitude;
                enriched.city = geoData.city;
                enriched.country = geoData.country_name;
              }
            }
          } catch (geoError) {
            console.error(`Geolocation failed for IP ${visitor.ip}`);
          }
        }

        return enriched;
      })
    );

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
      liveVisitors,
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
