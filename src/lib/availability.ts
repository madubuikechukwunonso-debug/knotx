// src/lib/availability.ts
'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AvailableSlot = {
  staffId: number;
  staffName: string;
  date: string;           // e.g. "2026-05-15"
  startTime: string;      // e.g. "09:00"
  endTime: string;        // e.g. "10:00"
  durationMinutes: number;
};

export async function getAvailableSlots(
  serviceId: number,
  month: string   // format: "2026-05"
): Promise<AvailableSlot[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { slotDurationMinutes: true },
  });

  if (!service) return [];

  const assignments = await prisma.serviceStaffAssignment.findMany({
    where: { serviceId },
    include: {
      staff: {
        select: {
          id: true,
          displayName: true,
        },
      },
    },
  });

  const slots: AvailableSlot[] = [];

  // TODO: Expand this with real slot generation logic (working hours, blocked slots, existing bookings, etc.)
  // For now we return empty array so the build passes and the booking page doesn't crash

  return slots;
}
