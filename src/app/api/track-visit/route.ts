// src/app/api/track-visit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, userId, displayName, userType } = body;

    // Get real client IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Default values
    let city: string | null = null;
    let country: string | null = null;

    // Only geolocate real public IPs
    if (ip && ip !== 'unknown' && ip !== '::1' && !ip.startsWith('127.')) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
          next: { revalidate: 86400 }, // Cache for 24 hours
        });

        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.city) city = geoData.city;
          if (geoData.country_name) country = geoData.country_name;
        }
      } catch (geoError) {
        console.error('Geolocation failed for IP:', ip);
      }
    }

    // Save visit with location data
    await prisma.visitorLog.create({
      data: {
        ip,
        page: page || '/',
        userId: userId ? parseInt(userId) : null,
        userType: userType || 'guest',
        displayName: displayName || null,
        userAgent: request.headers.get('user-agent') || null,
        city,
        country,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
