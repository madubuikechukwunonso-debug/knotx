// src/app/api/budget/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const total = await prisma.order.aggregate({
      _sum: { total: true },
    });

    return NextResponse.json({ total: total._sum.total || 0 });
  } catch (error) {
    return NextResponse.json({ total: 0 });
  }
}
