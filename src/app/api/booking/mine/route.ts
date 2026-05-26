// src/app/api/booking/mine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json(
        { error: "Unauthorized", bookings: [] },
        { status: 401 }
      );
    }

    const bookings = await prisma.booking.findMany({
      where: {
        userId: session.userId, // ← Only fetch THIS user's bookings
      },
      orderBy: { createdAt: "desc" },
      include: {
        // Add relations if you need staff/service details later
        // staff: true,
        // service: true,
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return NextResponse.json({ bookings: [] }, { status: 500 });
  }
}
