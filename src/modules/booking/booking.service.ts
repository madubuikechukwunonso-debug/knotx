// src/modules/booking/booking.service.ts
import { prisma } from "@/lib/prisma";
import type {
  AvailabilityInput,
  AvailableSlot,
  BookingSessionUser,
  CreateBookingInput,
} from "./booking.types";

function dayOfWeekFromDate(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.getDay();
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value: number) {
  const hours = Math.floor(value / 60).toString().padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// Generate possible start times
function buildSlots(startTime: string, endTime: string, stepMinutes: number): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];
  for (let current = start; current + stepMinutes <= end; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

// Improved: Check if there is enough continuous free time from the slot start
function isSlotAvailable(
  slotTime: string,
  serviceDurationMinutes: number,
  existingBookings: Array<{ time: string; durationMinutes: number }>,
  workingEndTime: string
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + serviceDurationMinutes;
  const dayEnd = timeToMinutes(workingEndTime);

  // Sort bookings by start time
  const sortedBookings = [...existingBookings].sort(
    (a, b) => timeToMinutes(a.time) - timeToMinutes(b.time)
  );

  // Find the next booking after (or overlapping) this slot
  let nextBookingStart = dayEnd; // default to end of day

  for (const booking of sortedBookings) {
    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + booking.durationMinutes;

    // If booking overlaps or starts after our slot
    if (bookingStart >= slotStart) {
      nextBookingStart = Math.min(nextBookingStart, bookingStart);
    }
  }

  // Check if we have enough continuous time until the next booking or end of day
  const availableUntil = Math.min(nextBookingStart, dayEnd);
  const availableMinutes = availableUntil - slotStart;

  return availableMinutes >= serviceDurationMinutes;
}

export async function listServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
}

export async function getAvailabilityForService(input: AvailabilityInput): Promise<AvailableSlot[]> {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });
  if (!service) return [];

  const dayOfWeek = dayOfWeekFromDate(input.date);

  const profiles = await prisma.staffProfile.findMany();
  const hours = await prisma.staffWorkingHour.findMany();
  const timeOffs = await prisma.staffTimeOff.findMany();

  const bookings = await prisma.booking.findMany({
    where: {
      date: input.date,
      status: { not: "cancelled" },
    },
    select: { staffUserId: true, time: true, durationMinutes: true },
  });

  const bookingEnabledProfiles = profiles.filter((p: any) => p.bookingEnabled);

  const availableByStaff = bookingEnabledProfiles.flatMap((profile: any) => {
    const working = hours.find(
      (h: any) => h.staffUserId === profile.userId && h.dayOfWeek === dayOfWeek && h.isWorking
    );
    if (!working) return [];

    const hasTimeOff = timeOffs.some((t: any) => {
      if (t.staffUserId !== profile.userId) return false;
      const start = new Date(t.startAt);
      const end = new Date(t.endAt);
      const target = new Date(`${input.date}T12:00:00`);
      return target >= start && target <= end;
    });
    if (hasTimeOff) return [];

    const braiderBookings = bookings.filter((b: any) => b.staffUserId === profile.userId);

    // Generate slots using service duration as step
    const allSlots = buildSlots(working.startTime, working.endTime, service.durationMinutes);

    // Filter slots that have enough continuous free time
    const availableSlots = allSlots.filter((slot) =>
      isSlotAvailable(slot, service.durationMinutes, braiderBookings, working.endTime)
    );

    return availableSlots.map((slot) => ({
      staffUserId: profile.userId,
      staffName: profile.displayName,
      time: slot,
    }));
  });

  return availableByStaff;
}

export async function createBooking(input: CreateBookingInput) {
  const service = await prisma.service.findFirst({
    where: { id: input.serviceId, active: true },
  });
  if (!service) throw new Error("Service not found");

  const bookingDate = new Date(`${input.date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new Error("Cannot book appointments in the past");
  }

  const available = await getAvailabilityForService({
    date: input.date,
    serviceId: input.serviceId,
  });

  const validSlot = available.find(
    (slot) => slot.staffUserId === input.staffUserId && slot.time === input.time
  );

  if (!validSlot) {
    // Check if slot exists but duration is too short
    const allSlots = await getAvailabilityForService({
      date: input.date,
      serviceId: input.serviceId,
    });

    const slotExists = allSlots.some(
      (slot) => slot.staffUserId === input.staffUserId && slot.time === input.time
    );

    if (slotExists) {
      throw new Error("Time too short for selected service");
    }

    throw new Error("Selected booking slot is no longer available");
  }

  const newBooking = await prisma.booking.create({
    data: {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      serviceId: service.id,
      staffUserId: input.staffUserId,
      serviceType: service.name,
      durationMinutes: input.durationMinutes ?? service.durationMinutes,
      price: service.price,
      paymentStatus: "unpaid",
      date: input.date,
      time: input.time,
      notes: input.notes,
      userId: input.userId,
      userType: input.userType,
      status: "pending",
    },
  });

  return newBooking;
}

export async function listMyBookings(user?: BookingSessionUser) {
  if (!user) return [];

  if (user.userType === "local") {
    return prisma.booking.findMany({
      where: { customerEmail: user.email || "" },
      orderBy: { createdAt: "desc" },
    });
  }

  return prisma.booking.findMany({
    where: {
      userId: user.userId,
      userType: user.userType,
    },
    orderBy: { createdAt: "desc" },
  });
}
