import { NextRequest, NextResponse } from "next/server";
import { createBooking, listMyBookings } from "@/modules/booking/booking.service";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.get("mine") !== "1") {
    return NextResponse.json({ ok: true, bookings: [] });
  }

  const session = await getSession();
  const bookings = await listMyBookings(session || undefined);

  return NextResponse.json({ ok: true, bookings });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSession();

    const booking = await createBooking({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      serviceId: body.serviceId,
      staffUserId: body.staffUserId,
      date: body.date,
      time: body.time,
      notes: body.notes,
      userId: session?.userId,
      userType: session?.userType,
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Failed to create booking",
      },
      { status: 500 },
    );
  }
}
