// src/app/api/admin/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [heroVideos, galleryImages] = await Promise.all([
      prisma.heroVideo.findMany({
        orderBy: { position: 'asc' }, // Use position for ordering
      }),
      prisma.galleryImage.findMany({
        orderBy: { position: 'asc' },
      }),
    ]);

    return NextResponse.json({ heroVideos, galleryImages });
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json(
      { heroVideos: [], galleryImages: [] },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, name, position } = body;

    if (typeof position !== 'number' || position < 0) {
      return NextResponse.json(
        { error: 'position is required and must be a number' },
        { status: 400 }
      );
    }

    if (type === 'hero') {
      // Delete existing video at this position (if any)
      await prisma.heroVideo.deleteMany({
        where: { position },
      });

      const video = await prisma.heroVideo.create({
        data: {
          url,
          name: name || `Hero Video ${position + 1}`,
          position,
        },
      });

      return NextResponse.json(video);
    }

    if (type === 'gallery') {
      // Delete existing image at this position (if any)
      await prisma.galleryImage.deleteMany({
        where: { position },
      });

      const image = await prisma.galleryImage.create({
        data: {
          url,
          name: name || `Gallery Image ${position + 1}`,
          position,
        },
      });

      return NextResponse.json(image);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
