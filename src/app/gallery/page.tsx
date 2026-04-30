// src/app/gallery/page.tsx
import { prisma } from '@/lib/prisma';
import GalleryPage from '@/src-pages/GalleryPage';

async function getGalleryItems() {
  try {
    return await prisma.galleryItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        type: true,
        url: true,
        title: true,
        caption: true,
        description: true,
        category: true,
      },
    });
  } catch (error) {
    console.error('Failed to fetch gallery items:', error);
    return [];
  }
}

export const dynamic = 'force-dynamic'; // Prevent build-time prerendering issues

export default async function GalleryRoute() {
  const items = await getGalleryItems();
  return <GalleryPage initialItems={items} />;
}
