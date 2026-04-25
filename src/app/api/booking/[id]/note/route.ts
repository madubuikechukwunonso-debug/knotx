// src/app/api/booking/[id]/note/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingId = parseInt(id);
    const { note } = await request.json();

    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { notes: note },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Failed to save note" },
      { status: 500 }
    );
  }
}
