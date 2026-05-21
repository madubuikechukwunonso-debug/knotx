'use server';

import { put } from '@vercel/blob';

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get('file') as File;
  const type = formData.get('type') as 'hero' | 'gallery';
  const position = parseInt(formData.get('position') as string, 10);

  if (!file) {
    return { success: false, error: 'No file provided' };
  }

  try {
    const blob = await put(
      `${type}/${Date.now()}-${file.name}`,
      file,
      {
        access: 'public',
        // No need to pass token here if BLOB_READ_WRITE_TOKEN is set in Vercel
      }
    );

    return {
      success: true,
      url: blob.url,
      name: file.name,
      position,
      type,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Upload failed' };
  }
}
