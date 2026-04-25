// src/app/api/booking/mine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // TODO: Add proper JWT token validation here in production
    const bookings = await prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // You can add relations later if needed
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ bookings: [] }, { status: 500 });
  }
}
