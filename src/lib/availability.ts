'use server';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAvailableSlots(serviceId: number, month: string) {
  // month = "2026-05"
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return [];

  const assignedStaff = await prisma.serviceStaffAssignment.findMany({
    where: { serviceId },
    include: { staff: true },
  });

  const slots = [];

  for (const assignment of assignedStaff) {
    const staff = assignment.staff;
    // Get working hours, time-offs, blocked slots, existing bookings...
    // Generate possible slots for each day in the month
    // Filter out conflicts
    // Push available { staffId, date, time, duration }
  }

  return slots;
}
