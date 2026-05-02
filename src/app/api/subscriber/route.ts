import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Add or reactivate subscriber
    await prisma.subscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {
        isActive: true,
        unsubscribedAt: null,
      },
      create: {
        email: email.toLowerCase().trim(),
        source: 'HOMEPAGE',
        isActive: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for subscribing!' 
    });
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    
    // Handle duplicate email gracefully
    if (error.code === 'P2002') {
      return NextResponse.json({ 
        success: true, 
        message: 'You are already subscribed!' 
      });
    }

    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}
