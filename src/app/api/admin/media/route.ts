// src/app/api/admin/media/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [heroVideos, galleryImages] = await Promise.all([
      prisma.heroVideo.findMany({ orderBy: { sortOrder: 'asc' } }),
      prisma.galleryImage.findMany({ orderBy: { sortOrder: 'asc' } }),
    ]);

    return NextResponse.json({ heroVideos, galleryImages });
  } catch (error) {
    console.error('Media API error:', error);
    return NextResponse.json({ heroVideos: [], galleryImages: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, url, name } = body;

    if (type === 'hero') {
      const video = await prisma.heroVideo.create({
        data: { url, name: name || 'Hero Video' },
      });
      return NextResponse.json(video);
    }

    if (type === 'gallery') {
      const image = await prisma.galleryImage.create({
        data: { url, name: name || 'Gallery Image' },
      });
      return NextResponse.json(image);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Media upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
