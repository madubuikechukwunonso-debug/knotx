import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function dayOfWeekFromDate(dateStr: string): number {
  const date = new Date(`${dateStr}T12:00:00`);
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

function buildSlots(startTime: string, endTime: string, stepMinutes: number): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];
  for (let current = start; current + stepMinutes <= end; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get('serviceId');

  if (serviceId) {
    // Return braiders assigned to this service, or ALL enabled braiders if none assigned yet
    // (this ensures newly created admin braiders with working hours appear immediately)
    let assignments = await prisma.serviceStaffAssignment.findMany({
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
      assignments = allEnabledStaff.map((staff: any) => ({ staff })) as any;
    }

    const braiders = assignments
      .filter((a: any) => a.staff.bookingEnabled)
      .map((a: any) => ({
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
    },
  });

  return NextResponse.json({ ok: true, services });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, serviceId, staffUserId } = body; // staffUserId is now optional for filtering to a specific braider

    if (!date || !serviceId) {
      return NextResponse.json({ ok: false, message: 'date and serviceId are required' }, { status: 400 });
    }

    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), active: true },
    });

    if (!service) {
      return NextResponse.json({ ok: false, message: 'Service not found' }, { status: 404 });
    }

    const dayOfWeek = dayOfWeekFromDate(date);

    // Get staff assigned to this service (filter by staffUserId if provided)
    const assignments = await prisma.serviceStaffAssignment.findMany({
      where: { 
        serviceId: Number(serviceId),
        ...(staffUserId ? { staffUserId: Number(staffUserId) } : {})
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

    const availableByStaff: any[] = [];

    for (const assignment of assignments) {
      const profile = assignment.staff;
      if (!profile.bookingEnabled) continue;

      // Get working hours for this day
      const working = await prisma.staffWorkingHour.findFirst({
        where: {
          staffUserId: profile.id,
          dayOfWeek,
          isWorking: true,
        },
      });

      if (!working) continue;

      // Check if the entire day is blocked (StaffTimeOff or BlockedSlot)
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

      // Get existing bookings for this staff on this date
      const existingBookings = await prisma.booking.findMany({
        where: {
          staffUserId: profile.id,
          date: date,
          status: { not: 'cancelled' },
        },
        select: { time: true },
      });

      const bookedTimes = new Set(existingBookings.map(b => b.time));

      // Generate slots using slotDurationMinutes (or fallback to durationMinutes)
      const stepMinutes = service.slotDurationMinutes || service.durationMinutes;
      const allSlots = buildSlots(working.startTime, working.endTime, stepMinutes);

      // Filter out booked times
      const freeSlots = allSlots
        .filter(slot => !bookedTimes.has(slot))
        .map(slot => ({
          staffUserId: profile.id,
          staffName: profile.displayName,
          time: slot,
          durationMinutes: service.durationMinutes,
        }));

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
