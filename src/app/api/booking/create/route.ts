// src/app/api/booking/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/modules/booking/booking.service";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { sendAdminNotification } from "@/lib/send-admin-notification";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  if (searchParams.get("mine") !== "1") {
    return NextResponse.json({ ok: true, bookings: [] });
  }
  const session = await getSession();
  return NextResponse.json({ ok: true, bookings: [] });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getSession();

    // Fetch service details (name + duration)
    const service = await prisma.service.findFirst({
      where: { id: Number(body.serviceId), active: true },
      select: { 
        id: true,
        name: true,
        durationMinutes: true 
      },
    });

    if (!service) {
      return NextResponse.json(
        { ok: false, message: "Service not found" },
        { status: 404 }
      );
    }

    // Create the booking
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
      durationMinutes: service.durationMinutes,
    });

    // ============================================
    // SEND NOTIFICATION TO SUPER ADMIN
    // ============================================
    await sendAdminNotification({
      type: "new_booking",
      title: `${body.customerName} booked ${service.name}`,
      details: `
        <p><strong>Customer:</strong> ${body.customerName}</p>
        <p><strong>Email:</strong> ${body.customerEmail}</p>
        <p><strong>Phone:</strong> ${body.customerPhone || "N/A"}</p>
        <p><strong>Service:</strong> ${service.name}</p>
        <p><strong>Date & Time:</strong> ${body.date} at ${body.time}</p>
        <p><strong>Braider ID:</strong> ${body.staffUserId}</p>
        ${body.notes ? `<p><strong>Notes:</strong> ${body.notes}</p>` : ""}
      `,
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error: any) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Failed to create booking",
      },
      { status: 500 }
    );
  }
}
