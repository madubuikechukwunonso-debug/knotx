import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingCity,
      shippingState,
      shippingPostalCode,
      shippingCountry,
      userId,
      userType,
      totalAmount,
    } = body;

    // Validate required fields
    if (!items || items.length === 0 || !customerEmail) {
      return NextResponse.json(
        { message: 'Missing required fields: items and customerEmail are required' },
        { status: 400 }
      );
    }

    // Get base URL with proper scheme
    const getBaseUrl = () => {
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
      }
      
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = request.headers.get('x-forwarded-proto') ||
                      (host.includes('localhost') ? 'http' : 'https');
      
      return `${protocol}://${host}`;
    };

    const baseUrl = getBaseUrl();

    // Create line items for Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'cad',
        product_data: {
          name: item.name || 'Product',
          description: `Quantity: ${item.quantity}`,
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: lineItems,
      success_url: `${baseUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart?canceled=true`,
      metadata: {
        type: 'order',  // ← CRITICAL: Tells webhook to create Order (not Booking) for admin section
        userId: userId ? userId.toString() : '',
        userType: userType || 'guest',
        customerName: customerName || '',
        customerEmail,
        customerPhone: customerPhone || '',
        shippingAddressLine1: shippingAddressLine1 || '',
        shippingAddressLine2: shippingAddressLine2 || '',
        shippingCity: shippingCity || '',
        shippingState: shippingState || '',
        shippingPostalCode: shippingPostalCode || '',
        shippingCountry: shippingCountry || 'Canada',
        items: JSON.stringify(items),
        totalAmount: totalAmount ? totalAmount.toString() : '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        message: error.message || 'Failed to create checkout session',
        error: error.type || 'unknown_error'
      },
      { status: 500 }
    );
  }
}
