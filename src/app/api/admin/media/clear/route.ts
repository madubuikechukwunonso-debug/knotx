// src/app/api/admin/media/clear/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');           // 'hero' or 'gallery'
  const positionParam = searchParams.get('position'); // optional: 0, 1, 2, 3...

  try {
    if (!type || (type !== 'hero' && type !== 'gallery')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "hero" or "gallery"' },
        { status: 400 }
      );
    }

    const position = positionParam !== null ? parseInt(positionParam, 10) : null;

    if (type === 'hero') {
      if (position !== null && !isNaN(position)) {
        // Delete only the specific video at this position
        await prisma.heroVideo.deleteMany({
          where: { position },
        });
      } else {
        // No position provided → delete all hero videos (legacy support)
        await prisma.heroVideo.deleteMany({});
      }
    } 
    
    else if (type === 'gallery') {
      if (position !== null && !isNaN(position)) {
        // Delete only the specific image at this position
        await prisma.galleryImage.deleteMany({
          where: { position },
        });
      } else {
        // No position provided → delete all gallery images (legacy support)
        await prisma.galleryImage.deleteMany({});
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: position !== null 
        ? `Deleted ${type} at position ${position}` 
        : `Deleted all ${type} media` 
    });

  } catch (error) {
    console.error('Clear media error:', error);
    return NextResponse.json(
      { error: 'Failed to clear media' }, 
      { status: 500 }
    );
  }
}
