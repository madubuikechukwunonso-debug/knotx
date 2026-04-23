import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  bookings,
  services,
  staffProfiles,
  staffTimeOff,
  staffWorkingHours,
} from "../../../db/schema";
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
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (value % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

function buildSlots(
  startTime: string,
  endTime: string,
  stepMinutes: number,
): string[] {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const slots: string[] = [];

  for (
    let current = start;
    current + stepMinutes <= end;
    current += stepMinutes
  ) {
    slots.push(minutesToTime(current));
  }

  return slots;
}

export async function listServices() {
  return db()
    .select()
    .from(services)
    .where(eq(services.active, 1))
    .orderBy(asc(services.sortOrder), asc(services.id));
}

export async function getAvailabilityForService(
  input: AvailabilityInput,
): Promise<AvailableSlot[]> {
  const serviceRows = await db()
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.active, 1)))
    .limit(1);

  if (serviceRows.length === 0) {
    return [];
  }

  const service = serviceRows[0];
  const dayOfWeek = dayOfWeekFromDate(input.date);

  const profiles = await db().select().from(staffProfiles);
  const hours = await db().select().from(staffWorkingHours);
  const timeOffRows = await db().select().from(staffTimeOff);
  const bookingRows = await db()
    .select()
    .from(bookings)
    .where(eq(bookings.date, input.date));

  const bookingEnabledProfiles = profiles.filter((profile) =>
    Boolean(profile.bookingEnabled),
  );

  const availableByStaff = bookingEnabledProfiles.flatMap((profile) => {
    const working = hours.find(
      (hour) =>
        hour.staffUserId === profile.userId &&
        hour.dayOfWeek === dayOfWeek &&
        Boolean(hour.isWorking),
    );

    if (!working) {
      return [];
    }

    const timeOffForDay = timeOffRows.some((item) => {
      if (item.staffUserId !== profile.userId) return false;

      const start = new Date(item.startAt);
      const end = new Date(item.endAt);
      const target = new Date(`${input.date}T12:00:00`);

      return target >= start && target <= end;
    });

    if (timeOffForDay) {
      return [];
    }

    const bookedTimes = new Set(
      bookingRows
        .filter(
          (row) =>
            row.staffUserId === profile.userId && row.status !== "cancelled",
        )
        .map((row) => row.time),
    );

    return buildSlots(
      working.startTime,
      working.endTime,
      service.durationMinutes,
    )
      .filter((slot) => !bookedTimes.has(slot))
      .map((slot) => ({
        staffUserId: profile.userId,
        staffName: profile.displayName,
        time: slot,
      }));
  });

  return availableByStaff;
}

export async function createBooking(input: CreateBookingInput) {
  const serviceRows = await db()
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.active, 1)))
    .limit(1);

  if (serviceRows.length === 0) {
    throw new Error("Service not found");
  }

  const service = serviceRows[0];

  const available = await getAvailabilityForService({
    date: input.date,
    serviceId: input.serviceId,
  });

  const validSlot = available.find(
    (slot) =>
      slot.staffUserId === input.staffUserId && slot.time === input.time,
  );

  if (!validSlot) {
    throw new Error("Selected booking slot is no longer available");
  }

  const result = await db().insert(bookings).values({
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
  });

  const id = Number(result[0].insertId);

  const created = await db()
    .select()
    .from(bookings)
    .where(eq(bookings.id, id))
    .limit(1);

  return created[0];
}

export async function listMyBookings(user?: BookingSessionUser) {
  if (!user) {
    return [];
  }

  if (user.userType === "local") {
    return db()
      .select()
      .from(bookings)
      .where(eq(bookings.customerEmail, user.email || ""))
      .orderBy(desc(bookings.createdAt));
  }

  return db()
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.userId, user.userId),
        eq(bookings.userType, user.userType),
      ),
    )
    .orderBy(desc(bookings.createdAt));
}
