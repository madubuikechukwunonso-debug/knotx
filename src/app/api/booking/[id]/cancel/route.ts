// src/app/api/booking/[id]/cancel/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = parseInt(params.id);

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to cancel booking" }, { status: 500 });
  }
}
