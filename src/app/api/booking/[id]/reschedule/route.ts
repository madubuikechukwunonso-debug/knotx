// src/app/api/booking/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json(
        { success: false, message: "Date and time are required" },
        { status: 400 }
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date,
        time,
        status: "pending",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking rescheduled successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to reschedule booking" },
      { status: 500 }
    );
  }
}
