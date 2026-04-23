import { NextResponse } from 'next/server';
import { getAvailabilityForService, listServices } from '@/modules/booking/booking.service';

export async function GET() {
  const services = await listServices();
  return NextResponse.json({ ok: true, services });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slots = await getAvailabilityForService({ date: body.date, serviceId: Number(body.serviceId) });
    return NextResponse.json({ ok: true, slots });
  } catch (error: any) {
    return NextResponse.json({ ok: false, message: error?.message || 'Availability failed' }, { status: 500 });
  }
}
