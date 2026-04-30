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

// Generate all possible start times
function buildSlots(startTime: string, endTime: string, stepMinutes: number): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];
  for (let current = start; current + stepMinutes <= end; current += stepMinutes) {
    slots.push(minutesToTime(current));
  }
  return slots;
}

// ============================================
// FIX: Check if a time slot overlaps with any existing booking
// ============================================
function isSlotAvailable(
  slotTime: string,
  serviceDurationMinutes: number,
  existingBookings: Array<{ time: string; durationMinutes: number }>
): boolean {
  const slotStart = timeToMinutes(slotTime);
  const slotEnd = slotStart + serviceDurationMinutes;

  for (const booking of existingBookings) {
    const bookingStart = timeToMinutes(booking.time);
    const bookingEnd = bookingStart + booking.durationMinutes;

    // Check for overlap
    if (slotStart < bookingEnd && slotEnd > bookingStart) {
      return false; // Slot overlaps with existing booking
    }
  }

  return true;
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
  
  // Get bookings with their duration
  const bookings = await prisma.booking.findMany({
    where: { 
      date: input.date,
      status: { not: "cancelled" },
    },
    select: { staffUserId: true, time: true, durationMinutes: true },
  });

  const bookingEnabledProfiles = profiles.filter((p) => p.bookingEnabled);

  const availableByStaff = bookingEnabledProfiles.flatMap((profile) => {
    const working = hours.find(
      (h) => h.staffUserId === profile.userId && h.dayOfWeek === dayOfWeek && h.isWorking
    );
    if (!working) return [];

    const hasTimeOff = timeOffs.some((t) => {
      if (t.staffUserId !== profile.userId) return false;
      const start = new Date(t.startAt);
      const end = new Date(t.endAt);
      const target = new Date(`${input.date}T12:00:00`);
      return target >= start && target <= end;
    });
    if (hasTimeOff) return [];

    // Get existing bookings for THIS specific braider
    const braiderBookings = bookings.filter((b) => b.staffUserId === profile.userId);

    // Generate all possible start times
    const allSlots = buildSlots(working.startTime, working.endTime, service.durationMinutes);

    // Filter out slots that overlap with existing bookings
    const availableSlots = allSlots.filter((slot) => 
      isSlotAvailable(slot, service.durationMinutes, braiderBookings)
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

  // ============================================
  // FIX: Validate date is not in the past
  // ============================================
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

  if (!validSlot) throw new Error("Selected booking slot is no longer available");

  const newBooking = await prisma.booking.create({
    data: {
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      serviceId: service.id,
      staffUserId: input.staffUserId,
      serviceType: service.name,
      durationMinutes: service.durationMinutes,
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
