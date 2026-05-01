import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Try multiple auth methods
    let userId = request.cookies.get('userId')?.value || 
                 request.cookies.get('session')?.value ||
                 request.headers.get('x-user-id');
    
    // If no userId found, try to get from localStorage via a different approach
    // For now, we'll return empty if no auth found (frontend will handle)
    if (!userId) {
      return NextResponse.json({ items: [] });
    }

    const wishlist = await prisma.wishlist.findMany({
      where: { userId: parseInt(userId) },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            description: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items: wishlist });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ items: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    let userId = request.cookies.get('userId')?.value || 
                 request.cookies.get('session')?.value ||
                 request.headers.get('x-user-id');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Please login to save to wishlist' }, { status: 401 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(productId),
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist' });
    }

    await prisma.wishlist.create({
      data: {
        userId: parseInt(userId),
        productId: parseInt(productId),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist add error:', error);
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();
    let userId = request.cookies.get('userId')?.value || 
                 request.cookies.get('session')?.value ||
                 request.headers.get('x-user-id');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: parseInt(userId),
          productId: parseInt(productId),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    return NextResponse.json({ error: 'Failed to remove' }, { status: 500 });
  }
}
