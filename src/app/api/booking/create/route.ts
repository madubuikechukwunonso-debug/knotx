import { NextResponse } from 'next/server';
import { createBookingSchema } from '@/modules/booking/booking.validation';
import { createBooking, listMyBookings } from '@/modules/booking/booking.service';
import { getSession } from '@/lib/session';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get('mine') !== '1') return NextResponse.json({ ok: true, bookings: [] });
  const session = await getSession();
  const bookings = await listMyBookings(session || undefined);
  return NextResponse.json({ ok: true, bookings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = createBookingSchema.parse(body);
    const booking = await createBooking(input);
    return NextResponse.json({ ok: true, booking });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || 'Booking failed' }, { status: 500 });
  }
}
