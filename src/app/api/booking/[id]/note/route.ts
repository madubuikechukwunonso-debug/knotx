// src/app/api/booking/[id]/note/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const bookingId = parseInt(params.id);
    const { note } = await req.json();

    // For now we store the note in the existing notes field
    // You can create a separate notes table later if you want full history
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: { 
        notes: note 
      },
    });

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "Failed to save note" }, { status: 500 });
  }
}
