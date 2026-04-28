// src/sections/admin/gallery-actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

async function uploadGalleryMedia(file: File): Promise<string> {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}-${safeName}`;

  const blob = await put(`gallery/${filename}`, file, {
    access: 'public',
  });

  return blob.url;
}

export async function uploadGalleryFiles(formData: FormData) {
  const files = formData.getAll('files') as File[];
  const title = (formData.get('title') as string) || undefined;
  const caption = (formData.get('caption') as string) || undefined;
  const description = (formData.get('description') as string) || undefined;
  const category = (formData.get('category') as string) || 'general';

  for (const file of files) {
    if (!file || file.size === 0) continue;

    const url = await uploadGalleryMedia(file);
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'image';

    await prisma.galleryItem.create({
      data: {
        type,
        url,
        thumbnailUrl: url,
        title: title || file.name.replace(/\.\w+$/, ''),
        caption,
        description,           // ← Now saved
        category,
        isFeatured: false,
        isActive: true,
        sortOrder: 0,
      },
    });
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/admin');
}

// Keep your existing delete and toggle functions
export async function deleteGalleryItem(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  await prisma.galleryItem.delete({ where: { id } });
  revalidatePath('/admin/gallery');
}

export async function toggleActive(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  const current = await prisma.galleryItem.findUnique({ where: { id } });
  if (!current) return;
  await prisma.galleryItem.update({
    where: { id },
    data: { isActive: !current.isActive },
  });
  revalidatePath('/admin/gallery');
}
