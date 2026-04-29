import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/permissions';

export async function GET() {
  await requireAdmin();

  try {
    const staff = await prisma.staffProfile.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        displayName: true,
        bio: true,
        bookingEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, staff });
  } catch (error) {
    console.error('Error fetching staff:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch staff' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  await requireAdmin();

  try {
    const body = await request.json();
    const { displayName, bio, bookingEnabled } = body;

    if (!displayName) {
      return NextResponse.json(
        { ok: false, error: 'Display name is required' },
        { status: 400 }
      );
    }

    // Create or link to a user
    let userId = body.userId;
    
    if (!userId) {
      // Create a new user for this staff member
      const newUser = await prisma.localUser.create({
        data: {
          email: `${displayName.toLowerCase().replace(/\s+/g, '')}@staff.local`,
          name: displayName,
          password: 'staff-default-password', // Should be changed by user
        },
      });
      userId = newUser.id;
    }

    const newStaff = await prisma.staffProfile.create({
      data: {
        userId,
        displayName,
        bio: bio || null,
        bookingEnabled: bookingEnabled ?? true,
      },
      select: {
        id: true,
        displayName: true,
        bio: true,
        bookingEnabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, staff: newStaff }, { status: 201 });
  } catch (error) {
    console.error('Error creating staff:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create staff member' },
      { status: 500 }
    );
  }
}
