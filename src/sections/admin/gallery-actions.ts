// src/sections/admin/gallery-actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function uploadGalleryFiles(formData: FormData) {
  const files = formData.getAll('files') as File[];
  const category = (formData.get('category') as string) || 'general';

  for (const file of files) {
    if (!file || file.size === 0) continue;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;
    const isVideo = file.type.startsWith('video/');
    const type = isVideo ? 'video' : 'image';
    await prisma.galleryItem.create({
      data: {
        type,
        title: file.name.replace(/\.\w+$/, ''),
        caption: '',
        url: dataUrl,
        thumbnailUrl: dataUrl,
        category,
        isFeatured: false,
        isActive: true,
        sortOrder: 0,
      },
    });
  }
  revalidatePath('/admin/gallery');
}

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
