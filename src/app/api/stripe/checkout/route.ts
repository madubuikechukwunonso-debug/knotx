import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      // Booking fields (existing)
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
      selectedAddons,
      totalAmount,
      
      // Order/Cart fields (new)
      type,           // 'booking' or 'order'
      items,          // Array of cart items for orders
      shippingAddress,
    } = body;

    // Validate based on type
    if (type === 'order') {
      if (!items || items.length === 0 || !customerEmail) {
        return NextResponse.json(
          { message: 'Missing required fields for order' },
          { status: 400 }
        );
      }
    } else {
      // Default to booking validation
      if (!serviceId || !staffUserId || !date || !time || !customerEmail) {
        return NextResponse.json(
          { message: 'Missing required fields' },
          { status: 400 }
        );
      }
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

    // ============================================
    // ORDER CHECKOUT (New)
    // ============================================
    if (type === 'order') {
      const totalAmountCalc = items.reduce((sum: number, item: any) => 
        sum + (item.price * item.quantity), 0
      );

      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'cad',
          product_data: {
            name: item.name,
            metadata: {
              productId: item.productId.toString(),
            },
          },
          unit_amount: item.price,
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customerEmail,
        line_items: lineItems,
        success_url: `${baseUrl}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/cart?canceled=true`,
        metadata: {
          type: 'order',
          customerName: customerName || '',
          customerEmail,
          customerPhone: customerPhone || '',
          userId: userId ? userId.toString() : '',
          userType: body.userType || '',
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '',
          items: JSON.stringify(items),
          totalAmount: totalAmountCalc.toString(),
        },
      });

      return NextResponse.json({ url: session.url });
    }

    // ============================================
    // BOOKING CHECKOUT (Existing - unchanged)
    // ============================================
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: serviceName || 'Hair Service',
              description: `${date} at ${time} with ${staffName}`,
            },
            unit_amount: depositAmount || 5000,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/booking?canceled=true`,
      metadata: {
        type: 'booking',  // Explicitly mark as booking
        serviceId: serviceId.toString(),
        staffUserId: staffUserId.toString(),
        date,
        time,
        customerName: customerName || '',
        customerEmail,
        customerPhone: customerPhone || '',
        notes: notes || '',
        userId: userId ? userId.toString() : '',
        selectedAddons: selectedAddons || '',
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
