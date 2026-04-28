// src/app/gallery/page.tsx
import GalleryPage from '@/src-pages/GalleryPage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getGalleryItems() {
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
}

export default async function GalleryRoute() {
  const items = await getGalleryItems();
  return <GalleryPage initialItems={items} />;
}
