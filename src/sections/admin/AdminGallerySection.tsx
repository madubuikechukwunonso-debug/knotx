// src/sections/admin/AdminGallerySection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminGalleryTable from './AdminGalleryTable';

const prisma = new PrismaClient();

async function getGalleryItems() {
  return prisma.galleryItem.findMany({
    orderBy: { sortOrder: 'asc' },
  });
}

// Server Actions
async function createGalleryItem(formData: FormData) {
  'use server';

  const type = ((formData.get('type') as string) || 'image').trim() || 'image';
  const title = formData.get('title') as string;
  const caption = ((formData.get('caption') as string) || '').trim() || undefined;
  const url = formData.get('url') as string;
  const thumbnailUrl = ((formData.get('thumbnailUrl') as string) || '').trim() || undefined;
  const category = ((formData.get('category') as string) || 'general').trim() || 'general';
  const isFeatured = formData.get('isFeatured') === 'on';
  const isActive = formData.get('isActive') === 'on';

  const sortOrderValue = formData.get('sortOrder') as string;
  const sortOrder = sortOrderValue ? parseInt(sortOrderValue, 10) : 0;

  await prisma.galleryItem.create({
    data: {
      type,
      title,
      caption,
      url,
      thumbnailUrl,
      category,
      isFeatured,
      isActive,
      sortOrder,
    },
  });

  revalidatePath('/admin/gallery');
}

async function updateGalleryItem(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string, 10);
  const type = ((formData.get('type') as string) || 'image').trim() || 'image';
  const title = formData.get('title') as string;
  const caption = ((formData.get('caption') as string) || '').trim() || undefined;
  const url = formData.get('url') as string;
  const thumbnailUrl = ((formData.get('thumbnailUrl') as string) || '').trim() || undefined;
  const category = ((formData.get('category') as string) || 'general').trim() || 'general';
  const isFeatured = formData.get('isFeatured') === 'on';
  const isActive = formData.get('isActive') === 'on';

  const sortOrderValue = formData.get('sortOrder') as string;
  const sortOrder = sortOrderValue ? parseInt(sortOrderValue, 10) : 0;

  await prisma.galleryItem.update({
    where: { id },
    data: {
      type,
      title,
      caption,
      url,
      thumbnailUrl,
      category,
      isFeatured,
      isActive,
      sortOrder,
    },
  });

  revalidatePath('/admin/gallery');
}

async function deleteGalleryItem(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string, 10);

  await prisma.galleryItem.delete({
    where: { id },
  });

  revalidatePath('/admin/gallery');
}

async function toggleActive(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string, 10);

  const current = await prisma.galleryItem.findUnique({
    where: { id },
  });

  if (!current) return;

  await prisma.galleryItem.update({
    where: { id },
    data: {
      isActive: !current.isActive,
    },
  });

  revalidatePath('/admin/gallery');
}

export default async function AdminGallerySection() {
  const items = await getGalleryItems();

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Gallery</h1>
          <p className="text-black/60">Curate and manage your image gallery</p>
        </div>

        <AdminGalleryTable
          items={items}
          onCreate={createGalleryItem}
          onUpdate={updateGalleryItem}
          onDelete={deleteGalleryItem}
          onToggleActive={toggleActive}
        />
      </div>
    </div>
  );
}
