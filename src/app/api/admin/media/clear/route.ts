import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');

  try {
    if (type === 'hero') {
      await prisma.heroVideo.deleteMany({});
    } else if (type === 'gallery') {
      await prisma.galleryImage.deleteMany({});
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 });
  }
}
