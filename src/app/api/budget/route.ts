// src/app/api/budget/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total spent (all time)
    const totalResult = await prisma.order.aggregate({
      _sum: { total: true },
    });

    // This month's spending
    const monthlyResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfMonth },
      },
    });

    // Today's spending
    const dailyResult = await prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: startOfDay },
      },
    });

    const total = totalResult._sum.total || 0;
    const monthly = monthlyResult._sum.total || 0;
    const daily = dailyResult._sum.total || 0;

    return NextResponse.json({
      total,      // Lifetime total
      monthly,    // Current month
      daily,      // Today
    });
  } catch (error) {
    console.error("Budget API error:", error);
    return NextResponse.json({
      total: 0,
      monthly: 0,
      daily: 0,
    });
  }
}
