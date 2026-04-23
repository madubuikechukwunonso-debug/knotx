import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { bookings, services, staffProfiles, staffTimeOff, staffWorkingHours } from '../../../../db/schema';
import type { BookingInput } from './booking.types';

function dayOfWeekFromDate(dateStr: string) { return new Date(`${dateStr}T12:00:00`).getDay(); }
function timeToMinutes(value: string) { const [h,m] = value.split(':').map(Number); return h*60 + m; }
function minutesToTime(value: number) { return `${String(Math.floor(value/60)).padStart(2,'0')}:${String(value%60).padStart(2,'0')}`; }
function buildSlots(startTime: string, endTime: string, stepMinutes: number) {
  const start=timeToMinutes(startTime), end=timeToMinutes(endTime), slots:string[]=[];
  for(let current=start; current+stepMinutes<=end; current+=stepMinutes) slots.push(minutesToTime(current));
  return slots;
}

const fallbackServices = [
  { id: 1, name: 'Box Braids', durationMinutes: 240, price: 18000, active: 1, sortOrder: 0 },
  { id: 2, name: 'Knotless Braids', durationMinutes: 300, price: 22000, active: 1, sortOrder: 1 },
  { id: 3, name: 'Cornrows', durationMinutes: 120, price: 8000, active: 1, sortOrder: 2 },
];

export async function listServices() {
  try {
    return db().select().from(services).where(eq(services.active,1)).orderBy(asc(services.sortOrder), asc(services.id));
  } catch { return fallbackServices; }
}

export async function getAvailabilityForService(input:{date:string; serviceId:number}) {
  try {
    const database = db();
    const [service] = await database.select().from(services).where(and(eq(services.id,input.serviceId), eq(services.active,1))).limit(1);
    if (!service) return [];
    const dayOfWeek = dayOfWeekFromDate(input.date);
    const profiles = await database.select().from(staffProfiles);
    const hours = await database.select().from(staffWorkingHours);
    const timeOffRows = await database.select().from(staffTimeOff);
    const bookingRows = await database.select().from(bookings).where(eq(bookings.date, input.date));
    return profiles.filter((p)=>Boolean(p.bookingEnabled)).flatMap((profile)=>{
      const working = hours.find((h)=>h.staffUserId===profile.userId && h.dayOfWeek===dayOfWeek && Boolean(h.isWorking));
      if (!working) return [];
      const hasTimeOff = timeOffRows.some((item)=>item.staffUserId===profile.userId && new Date(`${input.date}T12:00:00`) >= new Date(item.startAt) && new Date(`${input.date}T12:00:00`) <= new Date(item.endAt));
      if (hasTimeOff) return [];
      const booked = new Set(bookingRows.filter((row)=>row.staffUserId===profile.userId && row.status !== 'cancelled').map((row)=>row.time));
      return buildSlots(working.startTime, working.endTime, service.durationMinutes).filter((slot)=>!booked.has(slot)).map((time)=>({ staffUserId: profile.userId, staffName: profile.displayName, time }));
    });
  } catch {
    return ['10:00','11:00','12:00','14:00','15:00'].map((time)=>({ staffUserId: 1, staffName: 'Lead Stylist', time }));
  }
}

export async function createBooking(input: BookingInput) {
  const database = db();
  const [service] = await database.select().from(services).where(and(eq(services.id,input.serviceId), eq(services.active,1))).limit(1);
  if (!service) throw new Error('Service not found');
  const result = await database.insert(bookings).values({
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    serviceId: input.serviceId,
    staffUserId: input.staffUserId,
    serviceType: service.name,
    durationMinutes: service.durationMinutes,
    price: service.price,
    paymentStatus: 'unpaid',
    date: input.date,
    time: input.time,
    notes: input.notes,
    userId: input.userId,
    userType: input.userType,
    status: 'pending',
  });
  const id = Number(result[0].insertId);
  const [created] = await database.select().from(bookings).where(eq(bookings.id,id)).limit(1);
  return created;
}

export async function listMyBookings(user?: {id:number; userType:'local'|'oauth'; email?:string|null}) {
  if (!user) return [];
  const database = db();
  if (user.userType === 'local' && user.email) {
    return database.select().from(bookings).where(eq(bookings.customerEmail,user.email)).orderBy(desc(bookings.createdAt));
  }
  return database.select().from(bookings).where(and(eq(bookings.userId, user.id), eq(bookings.userType, user.userType))).orderBy(desc(bookings.createdAt));
}
