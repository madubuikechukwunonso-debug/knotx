import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createBooking } from '@/modules/booking/booking.service';
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

    try {
      // Create the booking now that payment is successful
      const booking = await createBooking({
        customerName: metadata.customerName || 'Guest',
        customerEmail: metadata.customerEmail || '',
        customerPhone: metadata.customerPhone || undefined,
        serviceId: parseInt(metadata.serviceId || '0'),
        staffUserId: parseInt(metadata.staffUserId || '0'),
        date: metadata.date || '',
        time: metadata.time || '',
        notes: metadata.notes || undefined,
        userId: metadata.userId ? parseInt(metadata.userId) : undefined,
        userType: metadata.userType && (metadata.userType === 'local' || metadata.userType === 'oauth') 
          ? (metadata.userType as 'local' | 'oauth') 
          : undefined,
      });

      // Update booking with payment info
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'paid',
          stripeCheckoutSessionId: session.id,
          status: 'pending', // Still pending confirmation from admin
        },
      });

      console.log(`Booking created and paid: ${booking.id} for session ${session.id}`);
    } catch (error: any) {
      console.error('Error creating booking from webhook:', error);
      // Don't fail the webhook, log for manual review
    }
  }

  return NextResponse.json({ received: true });
}
