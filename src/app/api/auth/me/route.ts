// src/app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ ok: false, user: null });
  }

  // Fetch full user data including shipping address
  const user = await prisma.localUser.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      displayName: true,
      username: true,
      role: true,
      // Shipping address fields
      shippingAddressLine1: true,
      shippingAddressLine2: true,
      shippingCity: true,
      shippingState: true,
      shippingPostalCode: true,
      shippingCountry: true,
      // You can add more fields here later if needed
    },
  });

  if (!user) {
    return NextResponse.json({ ok: false, user: null });
  }

  // Merge session + full DB user
  return NextResponse.json({
    ok: true,
    user: { ...session, ...user },
  });
}
