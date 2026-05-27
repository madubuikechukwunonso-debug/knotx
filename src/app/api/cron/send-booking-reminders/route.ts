// src/app/api/cron/send-booking-reminders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingReminder } from '@/lib/send-booking-reminder';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const now = new Date();

    const upcomingBookings = await prisma.booking.findMany({
      where: {
        status: { in: ['pending', 'confirmed'] },
      },
    });

    let sentCount = 0;

    for (const booking of upcomingBookings) {
      const appointmentDateTime = new Date(`${booking.date}T${booking.time}`);
      const diffInHours =
        (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      // Get braider email
      let braiderEmail: string | null = null;
      if (booking.staffUserId) {
        const staff = await prisma.localUser.findUnique({
          where: { id: booking.staffUserId },
          select: { email: true },
        });
        braiderEmail = staff?.email || null;
      }

      // 24-hour reminder
      if (diffInHours > 23 && diffInHours <= 24) {
        await sendBookingReminder(booking, '24h', braiderEmail);
        sentCount++;
      }

      // 12-hour reminder
      if (diffInHours > 11 && diffInHours <= 12) {
        await sendBookingReminder(booking, '12h', braiderEmail);
        sentCount++;
      }

      // 1-hour reminder (Braider + Admin only)
      if (diffInHours > 0.5 && diffInHours <= 1) {
        await sendBookingReminder(booking, '1h', braiderEmail);
        sentCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminders`,
    });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
