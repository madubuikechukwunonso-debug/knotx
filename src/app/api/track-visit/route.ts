import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, userId, displayName, userType } = body;

    // Get IP address
    const ip = 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') || 
      'unknown';

    await prisma.visitorLog.create({
      data: {
        ip,
        page: page || '/',
        userId: userId ? parseInt(userId) : null,
        userType: userType || 'guest',
        displayName: displayName || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Track visit error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
