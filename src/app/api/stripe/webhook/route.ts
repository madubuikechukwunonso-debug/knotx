import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ ok: false, message: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // Check if booking already exists (idempotency)
    const existingBooking = await prisma.booking.findFirst({
      where: { stripeCheckoutSessionId: session.id },
    });

    if (existingBooking) {
      console.log(`Booking already exists for session ${session.id}`);
      return NextResponse.json({ received: true });
    }

    try {
      if (!metadata.serviceId || !metadata.staffUserId || !metadata.date || !metadata.time) {
        console.error('Missing required metadata', metadata);
        return NextResponse.json({ received: true });
      }

      const serviceId = parseInt(metadata.serviceId);
      const staffUserId = parseInt(metadata.staffUserId);

      if (isNaN(serviceId) || isNaN(staffUserId)) {
        console.error('Invalid serviceId or staffUserId', metadata);
        return NextResponse.json({ received: true });
      }

      // Get service details
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
      });

      if (!service) {
        console.error('Service not found:', serviceId);
        return NextResponse.json({ received: true });
      }

      // ============================================
      // CREATE BOOKING DIRECTLY (skip availability check)
      // ============================================
      const isRegisteredUser = metadata.userId && metadata.userType && 
        (metadata.userType === 'local' || metadata.userType === 'oauth');

      const booking = await prisma.booking.create({
        data: {
          customerName: metadata.customerName || 'Guest',
          customerEmail: metadata.customerEmail || '',
          customerPhone: metadata.customerPhone || undefined,
          serviceId: service.id,
          staffUserId: staffUserId,
          serviceType: service.name,
          durationMinutes: service.durationMinutes,
          price: service.price,
          paymentStatus: 'paid',
          stripeCheckoutSessionId: session.id,
          date: metadata.date,
          time: metadata.time,
          notes: metadata.notes || undefined,
          userId: metadata.userId ? parseInt(metadata.userId) : undefined,
          userType: isRegisteredUser 
            ? (metadata.userType as 'local' | 'oauth')
            : 'guest',
          status: 'pending',
        },
      });

      console.log(`Booking created: ${booking.id} (userType: ${isRegisteredUser ? metadata.userType : 'guest'})`);

      // ============================================
      // SEND INVOICE EMAIL
      // ============================================
      try {
        const staff = await prisma.staffProfile.findUnique({
          where: { id: staffUserId },
          select: { displayName: true },
        });

        if (staff) {
          let selectedAddons: Array<{ name: string; price: number; quantity: number }> = [];
          if (metadata.selectedAddons) {
            try { selectedAddons = JSON.parse(metadata.selectedAddons); } catch {}
          }

          const totalAmount = session.amount_total || 
            (service.price + selectedAddons.reduce((sum, a) => sum + (a.price * a.quantity), 0));
          
          const depositAmount = session.amount_subtotal || 
            service.depositAmount || Math.round(totalAmount * 0.3);

          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-invoice`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: metadata.customerName || 'Guest',
              customerEmail: metadata.customerEmail || '',
              serviceName: service.name,
              servicePrice: service.price,
              depositAmount: depositAmount,
              selectedAddons: selectedAddons,
              totalAmount: totalAmount,
              bookingDate: metadata.date,
              bookingTime: metadata.time,
              braiderName: staff.displayName,
            }),
          });

          console.log(`Invoice email sent for booking ${booking.id}`);
        }
      } catch (invoiceError: any) {
        console.error('Failed to send invoice:', invoiceError);
      }

    } catch (error: any) {
      console.error('Error creating booking from webhook:', error);
    }
  }

  return NextResponse.json({ received: true });
}
