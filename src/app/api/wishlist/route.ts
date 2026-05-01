import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's wishlist
export async function GET(request: NextRequest) {
  try {
    // Get user from session (adjust based on your auth system)
    const userId = request.cookies.get('userId')?.value || 
                   request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ wishlist: [] });
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
          },
        },
      },
    });

    return NextResponse.json({ wishlist });
  } catch (error) {
    console.error('Wishlist fetch error:', error);
    return NextResponse.json({ wishlist: [] }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const { productId } = await request.json();
    const userId = request.cookies.get('userId')?.value || 
                   request.headers.get('x-user-id');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing user or product' }, { status: 400 });
    }

    // Check if already exists
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
    return NextResponse.json({ error: 'Failed to add' }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const { productId } = await request.json();
    const userId = request.cookies.get('userId')?.value || 
                   request.headers.get('x-user-id');

    if (!userId || !productId) {
      return NextResponse.json({ error: 'Missing user or product' }, { status: 400 });
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
