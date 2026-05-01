import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ reviews: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const customerName = formData.get('customerName') as string;
    const customerEmail = formData.get('customerEmail') as string;
    const customerPhone = formData.get('customerPhone') as string || undefined;
    const rating = parseInt(formData.get('rating') as string);
    const emoji = formData.get('emoji') as string;
    const comment = formData.get('comment') as string;
    const serviceType = formData.get('serviceType') as string;
    const imageFile = formData.get('image') as File | null;

    let imageUrl: string | undefined;
    if (imageFile && imageFile.size > 0) {
      const blob = await put(`reviews/${Date.now()}-${imageFile.name}`, imageFile, { access: 'public' });
      imageUrl = blob.url;
    }

    const review = await prisma.review.create({
      data: {
        customerName,
        customerEmail,
        customerPhone,
        rating,
        emoji,
        comment,
        serviceType,
        image: imageUrl,
        isApproved: true,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Review submit error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
