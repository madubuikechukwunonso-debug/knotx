import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    // Try multiple possible cookie names for auth token
    const token = 
      request.cookies.get('auth-token')?.value ||
      request.cookies.get('token')?.value ||
      request.cookies.get('session')?.value ||
      request.cookies.get('next-auth.session-token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    console.log('Profile API - Token found:', !!token);

    if (!token) {
      return NextResponse.json({ 
        error: 'Unauthorized', 
        debug: { cookies: request.cookies.getAll().map(c => c.name) }
      }, { status: 401 });
    }

    // Verify JWT token
    let payload: any;
    try {
      const { payload: verifiedPayload } = await jwtVerify(token, JWT_SECRET);
      payload = verifiedPayload;
    } catch (jwtError: any) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userEmail = payload.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const user = await prisma.localUser.findUnique({
      where: { email: userEmail },
      select: {
        id: true, email: true, displayName: true,
        shippingAddressLine1: true, shippingAddressLine2: true,
        shippingCity: true, shippingState: true,
        shippingPostalCode: true, shippingCountry: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id, email: user.email, name: user.displayName,
      shippingAddressLine1: user.shippingAddressLine1,
      shippingAddressLine2: user.shippingAddressLine2,
      shippingCity: user.shippingCity,
      shippingState: user.shippingState,
      shippingPostalCode: user.shippingPostalCode,
      shippingCountry: user.shippingCountry,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
