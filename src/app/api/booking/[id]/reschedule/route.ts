// src/app/api/booking/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = parseInt(params.id);
    const { date, time } = await req.json();

    if (!date || !time) {
      return NextResponse.json(
        { success: false, message: "Date and time are required" },
        { status: 400 }
      );
    }

    // Update the booking with new date and time
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        date,
        time,
        status: "pending",           // Reset status so stylist can confirm again
      },
    });

    return NextResponse.json({
      success: true,
      message: "Booking rescheduled successfully",
      booking: updatedBooking,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to reschedule booking" },
      { status: 500 }
    );
  }
}
