import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { staffUserId, workingHours } = await request.json();

  // Delete old hours
  await prisma.staffWorkingHour.deleteMany({
    where: { staffUserId },
  });

  // Create new hours
  await prisma.staffWorkingHour.createMany({
    data: workingHours.map((h: any) => ({
      staffUserId,
      dayOfWeek: h.dayOfWeek,
      startTime: h.startTime,
      endTime: h.endTime,
      isWorking: h.isWorking,
    })),
  });

  return NextResponse.json({ success: true });
}
