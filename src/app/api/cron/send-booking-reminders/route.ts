// src/app/api/cron/send-booking-reminders/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendBookingReminder } from '@/lib/send-booking-reminder';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // ============================================
    // SECURITY: Verify Vercel Cron Secret
    // ============================================
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.warn('Unauthorized cron attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Fetch upcoming bookings
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

      // Get braider's email
      let braiderEmail: string | null = null;
      if (booking.staffUserId) {
        const staff = await prisma.localUser.findUnique({
          where: { id: booking.staffUserId },
          select: { email: true },
        });
        braiderEmail = staff?.email || null;
      }

      // 24-hour reminder → Customer + Braider
      if (diffInHours > 23 && diffInHours <= 24) {
        await sendBookingReminder(booking, '24h', braiderEmail);
        sentCount++;
      }

      // 12-hour reminder → Customer + Braider
      if (diffInHours > 11 && diffInHours <= 12) {
        await sendBookingReminder(booking, '12h', braiderEmail);
        sentCount++;
      }

      // 1-hour reminder → Braider + Admin only
      if (diffInHours > 0.5 && diffInHours <= 1) {
        await sendBookingReminder(booking, '1h', braiderEmail);
        sentCount++;
      }
    }

    console.log(`[Cron] Booking reminders sent: ${sentCount}`);

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} reminders`,
    });
  } catch (error) {
    console.error('Reminder cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process reminders' },
      { status: 500 }
    );
  }
}
