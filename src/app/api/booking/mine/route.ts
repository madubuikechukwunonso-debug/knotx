// src/app/api/booking/mine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // TODO: Add token validation here (same as /api/auth/me)
    const bookings = await prisma.booking.findMany({
      where: { status: { not: "cancelled" } },
      orderBy: { createdAt: "desc" },
      include: {
        // Add relations if needed later
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
