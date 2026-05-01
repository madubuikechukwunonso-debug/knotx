import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);
    const status = formData.get('status') as string;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        shippingStatus: status === 'fulfilled' ? 'shipped' : 'pending',
        fulfilledAt: status === 'fulfilled' ? new Date() : null,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
      if (status === 'paid') {
        await fetch(`${baseUrl}/api/send-order-confirmation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            orderId: order.id,
            total: order.total,
            items: order.items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.price,
            })),
            shippingAddress: {
              line1: order.shippingAddressLine1,
              line2: order.shippingAddressLine2,
              city: order.shippingCity,
              state: order.shippingState,
              postalCode: order.shippingPostalCode,
              country: order.shippingCountry,
            },
          }),
        });
        console.log(`Order confirmation email sent for order #${order.id}`);
      }

      if (status === 'shipped') {
        await fetch(`${baseUrl}/api/send-order-shipped`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            orderId: order.id,
            trackingNumber: order.trackingNumber || 'Pending',
            shippingCarrier: order.shippingCarrier || 'Standard Shipping',
            estimatedDelivery: '5-7 business days',
          }),
        });
        console.log(`Shipping notification email sent for order #${order.id}`);
      }

      if (status === 'fulfilled') {
        await fetch(`${baseUrl}/api/send-order-delivered`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            orderId: order.id,
            deliveredAt: new Date().toISOString(),
          }),
        });
        console.log(`Delivery confirmation email sent for order #${order.id}`);
      }

      if (status === 'cancelled') {
        await fetch(`${baseUrl}/api/send-order-cancelled`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            orderId: order.id,
            cancelledAt: new Date().toISOString(),
            reason: 'Order cancelled by admin',
          }),
        });
        console.log(`Cancellation email sent for order #${order.id}`);
      }
    } catch (emailError) {
      console.error('Failed to send email notification:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: `Order status updated to ${status} and notification email sent` 
    });

  } catch (error) {
    console.error('Update status error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
