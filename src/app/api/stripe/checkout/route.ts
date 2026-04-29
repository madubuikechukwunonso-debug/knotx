import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      serviceId,
      staffUserId,
      staffName,
      date,
      time,
      customerName,
      customerEmail,
      customerPhone,
      notes,
      depositAmount,
      serviceName,
      userId,
      userType,
    } = body;

    if (!serviceId || !staffUserId || !date || !time || !customerEmail || !depositAmount) {
      return NextResponse.json(
        { ok: false, message: 'Missing required fields for checkout' },
        { status: 400 }
      );
    }

    // Verify service and get details
    const service = await prisma.service.findFirst({
      where: { id: Number(serviceId), active: true },
    });

    if (!service) {
      return NextResponse.json({ ok: false, message: 'Service not found' }, { status: 404 });
    }

    const amount = depositAmount || service.depositAmount || Math.round(service.price * 0.3);

    if (amount <= 0) {
      return NextResponse.json({ ok: false, message: 'Invalid deposit amount' }, { status: 400 });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: service.priceCurrency || 'cad',
            product_data: {
              name: `Deposit: ${serviceName || service.name}`,
              description: `Appointment with ${staffName} on ${date} at ${time}`,
              metadata: {
                serviceId: service.id.toString(),
                staffUserId: staffUserId.toString(),
              },
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        serviceId: serviceId.toString(),
        staffUserId: staffUserId.toString(),
        staffName: staffName || '',
        date,
        time,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        notes: notes || '',
        userId: userId?.toString() || '',
        userType: userType || 'guest',
        serviceName: serviceName || service.name,
        fullPrice: service.price.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/book`,
      expires_at: Math.floor(Date.now() / 1000) + 60 * 30, // 30 min expiry
    });

    return NextResponse.json({
      ok: true,
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || 'Failed to create checkout session',
      },
      { status: 500 }
    );
  }
}
