// src/sections/admin/messages-actions.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { sentAt: 'asc' },
      },
    },
  });
}

export async function markAsRead(formData: FormData) {
  const id = parseInt(formData.get('id') as string, 10);
  await prisma.contactMessage.update({
    where: { id },
    data: {
      read: true,
      status: 'read',
    },
  });
  revalidatePath('/admin/messages');
}

export async function sendReply(formData: FormData) {
  const messageId = parseInt(formData.get('messageId') as string, 10);
  const body = (formData.get('body') as string)?.trim();
  if (!body || !messageId) return;

  await prisma.contactReply.create({
    data: {
      messageId,
      sentById: 1, // TODO: replace with real logged-in admin/staff ID from session
      body,
    },
  });

  await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      status: 'replied',
      lastRepliedAt: new Date(),
      read: true,
    },
  });
  revalidatePath('/admin/messages');
}

export async function endChat(formData: FormData) {
  const email = formData.get('email') as string;
  if (!email) return;

  // Find all message IDs for this email
  const userMessages = await prisma.contactMessage.findMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  });

  const messageIds = userMessages.map((m) => m.id);

  if (messageIds.length === 0) return;

  // Delete all replies for these messages
  await prisma.contactReply.deleteMany({
    where: { messageId: { in: messageIds } },
  });

  // Delete all messages from this sender
  await prisma.contactMessage.deleteMany({
    where: { id: { in: messageIds } },
  });

  revalidatePath('/admin/messages');
}
