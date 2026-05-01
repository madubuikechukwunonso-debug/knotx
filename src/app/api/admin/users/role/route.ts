import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, role } = body;

    if (!id || !role) {
      return NextResponse.json({ error: 'User ID and role are required' }, { status: 400 });
    }

    const validRoles = ['user', 'worker', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedUser = await prisma.localUser.update({
      where: { id: parseInt(id) },
      data: { role },
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
    console.error('Error changing user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to change user role' },
      { status: 500 }
    );
  }
}
