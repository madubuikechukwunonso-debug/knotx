// src/app/api/addons/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const addons = await prisma.addon.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        description: true,
      },
    });
    return NextResponse.json(addons);
  } catch (error) {
    console.error('Error fetching addons:', error);
    return NextResponse.json({ error: 'Failed to fetch addons' }, { status: 500 });
  }
}
