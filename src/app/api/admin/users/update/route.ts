import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, displayName, email, role } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.localUser.update({
      where: { id: parseInt(id) },
      data: {
        displayName: displayName || undefined,
        email: email || undefined,
        role: role || undefined,
      },
      select: {
        id: true,
        displayName: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        isBlocked: true,
        blockedReason: true,
        createdAt: true,
        lastSignInAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}
