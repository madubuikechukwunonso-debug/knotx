// src/app/api/wishlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const wishlist = await prisma.wishlist.findMany({
      include: {
        product: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items: wishlist });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}
