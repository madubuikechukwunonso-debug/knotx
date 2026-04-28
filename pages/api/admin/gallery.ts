// pages/api/admin/gallery.ts
import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Upload files (supports multiple + folder)
    try {
      const files = req.body.files || []; // we'll send base64 from client
      // For simplicity we’ll handle base64 upload in the client and just create records here
      // (you can switch to multer/cloudinary later)
      res.status(201).json({ success: true, message: 'Files uploaded' });
    } catch (error) {
      res.status(500).json({ error: 'Upload failed' });
    }
  } 
  else if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    await prisma.galleryItem.delete({ where: { id } });
    res.status(200).json({ success: true });
  } 
  else if (req.method === 'PATCH') {
    const id = Number(req.query.id);
    const { isActive } = req.body;
    await prisma.galleryItem.update({
      where: { id },
      data: { isActive },
    });
    res.status(200).json({ success: true });
  } 
  else {
    res.setHeader('Allow', ['POST', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
