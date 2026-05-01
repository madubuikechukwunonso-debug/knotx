import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Try to get user ID from various sources (no JWT verification needed)
    let userId: number | null = null;
    let userEmail: string | null = null;

    // Method 1: Check for userId cookie (simple session)
    const userIdCookie = request.cookies.get('userId')?.value || 
                         request.cookies.get('user-id')?.value ||
                         request.cookies.get('uid')?.value;
    
    if (userIdCookie) {
      userId = parseInt(userIdCookie);
    }

    // Method 2: Check for email in cookie (if stored)
    const emailCookie = request.cookies.get('userEmail')?.value ||
                        request.cookies.get('email')?.value;
    
    if (emailCookie) {
      userEmail = emailCookie;
    }

    // Method 3: Check Authorization header for simple userId
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('User ')) {
      userId = parseInt(authHeader.replace('User ', ''));
    }

    // If no userId or email found, return unauthorized
    if (!userId && !userEmail) {
      console.log('Profile API: No user session found');
      return NextResponse.json({ 
        error: 'Not logged in',
        debug: 'No userId or email in cookies'
      }, { status: 401 });
    }

    // Find user in LocalUser table
    const user = await prisma.localUser.findFirst({
      where: userId 
        ? { id: userId }
        : { email: userEmail! },
      select: {
        id: true,
        email: true,
        displayName: true,
        shippingAddressLine1: true,
        shippingAddressLine2: true,
        shippingCity: true,
        shippingState: true,
        shippingPostalCode: true,
        shippingCountry: true,
      },
    });

    if (!user) {
      console.log('Profile API: User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile API: Success for user', user.email);

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.displayName,
      shippingAddressLine1: user.shippingAddressLine1,
      shippingAddressLine2: user.shippingAddressLine2,
      shippingCity: user.shippingCity,
      shippingState: user.shippingState,
      shippingPostalCode: user.shippingPostalCode,
      shippingCountry: user.shippingCountry,
    });
  } catch (error: any) {
    console.error('Profile API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
