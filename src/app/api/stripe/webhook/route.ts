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

    // ============================================
    // HANDLE ORDER CHECKOUT (Shop Products)
    // ============================================
    if (metadata.type === 'order') {
      try {
        // Check if order already exists (idempotency)
        const existingOrder = await prisma.order.findFirst({
          where: { stripePaymentIntent: session.payment_intent as string },
        });

        if (existingOrder) {
          console.log(`Order already exists for session ${session.id}`);
          return NextResponse.json({ received: true });
        }

        // Parse items from metadata
        let items: Array<{ productId: number; quantity: number; price: number; name: string }> = [];
        if (metadata.items) {
          try {
            items = JSON.parse(metadata.items);
          } catch (e) {
            console.error('Failed to parse items from metadata');
          }
        }

        // Create the order with items
        const order = await prisma.order.create({
          data: {
            customerName: metadata.customerName || 'Guest',
            customerEmail: metadata.customerEmail || '',
            customerPhone: metadata.customerPhone || undefined,
            total: parseInt(metadata.totalAmount || '0'),
            status: 'paid',
            shippingStatus: 'pending',
            stripePaymentIntent: session.payment_intent as string,
            userId: metadata.userId ? parseInt(metadata.userId) : undefined,
            userType: metadata.userType || undefined,
            items: {
              create: items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.price,
              })),
            },
          },
        });

        console.log(`Order created: ${order.id} for session ${session.id}`);

        // ============================================
        // REMOVE ONLY THE PAID ITEMS FROM WISHLIST
        // ============================================
        try {
          const userId = metadata.userId ? parseInt(metadata.userId) : null;

          if (userId && items.length > 0) {
            const purchasedProductIds = items.map(item => item.productId);

            await prisma.wishlist.deleteMany({
              where: {
                userId: userId,
                productId: { in: purchasedProductIds },
              },
            });

            console.log(`Removed ${purchasedProductIds.length} paid items from wishlist for user ${userId}`);
          }
        } catch (wishlistError) {
          console.error('Failed to remove wishlist items:', wishlistError);
          // Don't fail the webhook
        }
        // ============================================

        // Send order confirmation email
        try {
          await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-order-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              customerName: metadata.customerName,
              customerEmail: metadata.customerEmail,
              orderId: order.id,
              total: order.total,
              items: items,
            }),
          });
          console.log(`Order confirmation email sent for order ${order.id}`);
        } catch (emailError) {
          console.error('Failed to send order confirmation email:', emailError);
        }

      } catch (error: any) {
        console.error('Error creating order from webhook:', error);
      }
    }

    // ============================================
    // HANDLE BOOKING CHECKOUT (Services)
    // ============================================
    else {
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

        // Create booking directly
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

        // Send invoice email
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
  }

  return NextResponse.json({ received: true });
}
