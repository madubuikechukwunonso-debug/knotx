import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const id = parseInt(formData.get('id') as string);

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        customerName: formData.get('customerName') as string,
        customerEmail: formData.get('customerEmail') as string,
        customerPhone: formData.get('customerPhone') as string || null,
        total: parseInt(formData.get('total') as string) || 0,
        shippingAddressLine1: formData.get('shippingAddressLine1') as string || null,
        shippingAddressLine2: formData.get('shippingAddressLine2') as string || null,
        shippingCity: formData.get('shippingCity') as string || null,
        shippingState: formData.get('shippingState') as string || null,
        shippingPostalCode: formData.get('shippingPostalCode') as string || null,
        shippingCountry: formData.get('shippingCountry') as string || 'Canada',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
