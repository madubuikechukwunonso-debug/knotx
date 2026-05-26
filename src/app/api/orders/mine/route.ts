// src/app/api/orders/mine/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session?.userId) {
      return NextResponse.json({ orders: [] }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.userId,
      },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ orders: [] }, { status: 500 });
  }
}
