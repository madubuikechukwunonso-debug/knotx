// src/app/api/booking/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/modules/booking/booking.service";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  if (searchParams.get("mine") !== "1") {
    return NextResponse.json({ ok: true, bookings: [] });
  }

  const session = await getSession();
  // You may want to implement listMyBookings properly
  return NextResponse.json({ ok: true, bookings: [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSession();

    // Fetch service to get durationMinutes explicitly
    const service = await prisma.service.findFirst({
      where: { id: Number(body.serviceId), active: true },
      select: { durationMinutes: true },
    });

    if (!service) {
      return NextResponse.json(
        { ok: false, message: "Service not found" },
        { status: 404 }
      );
    }

    const booking = await createBooking({
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      serviceId: Number(body.serviceId),
      staffUserId: Number(body.staffUserId),
      date: body.date,
      time: body.time,
      notes: body.notes,
      userId: session?.userId,
      userType: session?.userType,
      // Explicitly pass duration for clarity and future-proofing
      durationMinutes: service.durationMinutes,
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
