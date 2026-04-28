import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { staffUserId, date, reason } = await request.json();

  await prisma.blockedSlot.create({
    data: {
      staffUserId,
      date,
      startTime: '00:00',
      endTime: '23:59',
      reason: reason || 'Staff unavailable',
    },
  });

  return NextResponse.json({ success: true });
}
