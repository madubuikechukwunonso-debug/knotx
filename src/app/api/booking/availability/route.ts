// src/app/api/booking/availability/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function dayOfWeekFromDate(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  return date.getDay();
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number): string {
  const hours = Math.floor(value / 60).toString().padStart(2, '0');
  const minutes = (value % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Checks if two time ranges overlap
 */
function timesOverlap(
  start1: number,
  duration1: number,
  start2: number,
  duration2: number
): boolean {
  const end1 = start1 + duration1;
  const end2 = start2 + duration2;
  return start1 < end2 && end1 > start2;
}

/**
 * Returns true only if there is enough continuous free time
 * from the proposed start time until the next booking or end of working hours.
 */
function hasEnoughContinuousTime(
  slotStartMinutes: number,
  serviceDurationMinutes: number,
  existingBookings: Array<{ time: string; durationMinutes: number }>,
  workingEndTime: string
): boolean {
  const slotEndMinutes = slotStartMinutes + serviceDurationMinutes;
  const dayEndMinutes = timeToMinutes(workingEndTime);

  // Sort bookings by start time
  const sortedBookings = [...existingBookings].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Check for any direct overlap first
  const hasDirectOverlap = sortedBookings.some((booking) => {
    const bookedStart = timeToMinutes(booking.time);
    const bookedDuration = booking.durationMinutes || serviceDurationMinutes;
    return timesOverlap(slotStartMinutes, serviceDurationMinutes, bookedStart, bookedDuration);
  });

  if (hasDirectOverlap) return false;

  // Find the next booking that starts at or after this slot
  let nextBookingStart = dayEndMinutes;

  for (const booking of sortedBookings) {
    const bookingStart = timeToMinutes(booking.time);
    if (bookingStart >= slotStartMinutes) {
      nextBookingStart = bookingStart;
      break;
    }
  }

  const availableMinutes = nextBookingStart - slotStartMinutes;
  return availableMinutes >= serviceDurationMinutes;
}

function buildSlots(
  startTime: string,
  endTime: string,
  stepMinutes: number,
  serviceDurationMinutes: number
): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];
  const latestStart = end - serviceDurationMinutes;

  for (let current = start; current <= latestStart; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

interface StaffProfile {
  id: number;
  displayName: string | null;
  bookingEnabled: boolean;
  bio?: string | null;
}

interface Assignment {
  staff: StaffProfile;
}

interface ExistingBooking {
  time: string;
  durationMinutes: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');

  if (serviceId) {
    let assignments: Assignment[] = await prisma.serviceStaffAssignment.findMany({
      where: { serviceId: Number(serviceId) },
      include: {
        staff: {
          select: {
            id: true,
            displayName: true,
            bookingEnabled: true,
            bio: true,
          },
        },
      },
    });

    if (assignments.length === 0) {
      const allEnabledStaff = await prisma.staffProfile.findMany({
        where: { bookingEnabled: true },
        select: { id: true, displayName: true, bio: true, bookingEnabled: true },
      });

      assignments = allEnabledStaff.map((staffProfile: any) => ({
        staff: staffProfile as StaffProfile,
      }));
    }

    const braiders = assignments
      .filter((a) => a.staff.bookingEnabled)
      .map((a) => ({
        staffUserId: a.staff.id,
        name: a.staff.displayName,
        bio: a.staff.bio,
      }));

    return NextResponse.json({ ok: true, braiders });
  }

  const services = await prisma.service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      depositAmount: true,
      durationMinutes: true,
      slotDurationMinutes: true,
      image: true,
      hairRequirement: true,
      categoryId: true,
    },
  });

  return NextResponse.json({ ok: true, services });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, serviceId, staffUserId } = body;

    if (!date || !serviceId) {
      return NextResponse.json(
        { ok: false, message: 'date and serviceId are required' },
        { status: 400 }
      );
    }

    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), active: true },
    });

    if (!service) {
      return NextResponse.json(
        { ok: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    const dayOfWeek = dayOfWeekFromDate(date);

    let assignments: Assignment[] = await prisma.serviceStaffAssignment.findMany({
      where: {
        serviceId: Number(serviceId),
        ...(staffUserId ? { staffUserId: Number(staffUserId) } : {}),
      },
      include: {
        staff: {
          select: {
            id: true,
            displayName: true,
            bookingEnabled: true,
          },
        },
      },
    });

    if (assignments.length === 0) {
      const allEnabled = await prisma.staffProfile.findMany({
        where: { bookingEnabled: true },
        select: { id: true, displayName: true, bookingEnabled: true },
      });

      assignments = allEnabled.map((staffProfile: any) => ({
        staff: staffProfile as StaffProfile,
      }));
    }

    const availableByStaff: any[] = [];

    for (const assignment of assignments) {
      const profile = assignment.staff;
      if (!profile.bookingEnabled) continue;

      const working = await prisma.staffWorkingHour.findFirst({
        where: {
          staffUserId: profile.id,
          dayOfWeek,
          isWorking: true,
        },
      });

      if (!working) continue;

      const hasFullDayBlock = await prisma.staffTimeOff.findFirst({
        where: {
          staffUserId: profile.id,
          startAt: { lte: new Date(`${date}T23:59:59`) },
          endAt: { gte: new Date(`${date}T00:00:00`) },
        },
      });

      const hasBlockedSlot = await prisma.blockedSlot.findFirst({
        where: {
          staffUserId: profile.id,
          date: date,
        },
      });

      if (hasFullDayBlock || hasBlockedSlot) continue;

      const existingBookings = await prisma.booking.findMany({
        where: {
          staffUserId: profile.id,
          date: date,
          status: { not: 'cancelled' },
        },
        select: { time: true, durationMinutes: true },
      }) as ExistingBooking[];

      const stepMinutes = service.slotDurationMinutes || 60;
      const allSlots = buildSlots(
        working.startTime,
        working.endTime,
        stepMinutes,
        service.durationMinutes
      );

      const freeSlots: any[] = [];

      for (const slot of allSlots) {
        const candidateStart = timeToMinutes(slot);

        const isValid = hasEnoughContinuousTime(
          candidateStart,
          service.durationMinutes,
          existingBookings,
          working.endTime
        );

        if (isValid) {
          freeSlots.push({
            staffUserId: profile.id,
            staffName: profile.displayName,
            time: slot,
          });
        }
      }

      availableByStaff.push(...freeSlots);
    }

    return NextResponse.json({ ok: true, slots: availableByStaff });
  } catch (error: any) {
    console.error('Availability error:', error);
    return NextResponse.json(
      { ok: false, message: error?.message || 'Availability failed' },
      { status: 500 }
    );
  }
}
