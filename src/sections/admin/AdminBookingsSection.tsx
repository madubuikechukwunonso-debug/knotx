import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import AdminBookingTable from './AdminBookingTable';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

// ====================== SERVER ACTIONS ======================
async function createBooking(formData: FormData) {
  'use server';

  const customerName = formData.get('customerName') as string;
  const customerEmail = formData.get('customerEmail') as string;
  const customerPhone = (formData.get('customerPhone') as string) || undefined;
  const serviceId = parseInt(formData.get('serviceId') as string);
  const serviceType = formData.get('serviceType') as string;
  const durationMinutes = parseInt(formData.get('durationMinutes') as string);
  const price = parseInt(formData.get('price') as string);
  const date = formData.get('date') as string;
  const time = formData.get('time') as string;
  const status = formData.get('status') as string;
  const paymentStatus = formData.get('paymentStatus') as string;
  const notes = (formData.get('notes') as string) || undefined;

  // Create the booking
  const booking = await prisma.booking.create({
    data: {
      customerName,
      customerEmail,
      customerPhone,
      serviceId: serviceId || undefined,
      serviceType,
      durationMinutes,
      price,
      date,
      time,
      status,
      paymentStatus,
      notes,
    },
  });

  revalidatePath('/admin/bookings');

  // ============================================
  // IF PAYMENT STATUS IS UNPAID → SEND PAYMENT LINK
  // ============================================
  if (paymentStatus === 'unpaid') {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const depositAmount = Math.round(price * 0.3);

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: customerEmail,
        line_items: [
          {
            price_data: {
              currency: 'cad',
              product_data: {
                name: `Deposit for ${serviceType}`,
                description: `Booking on ${date} at ${time}`,
              },
              unit_amount: depositAmount,
            },
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/booking`,
        metadata: {
          bookingId: booking.id.toString(),
          type: 'manual_booking_deposit',
        },
      });

      await fetch(`${baseUrl}/api/send-payment-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerEmail,
          serviceName: serviceType,
          bookingDate: date,
          bookingTime: time,
          paymentLink: session.url,
          depositAmount,
          bookingId: booking.id,
        }),
      });

      console.log(`Payment link sent for booking #${booking.id}`);
    } catch (error) {
      console.error('Failed to create/send payment link:', error);
    }
  }
}

async function updateBooking(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  const newStatus = formData.get('status') as string;
  const oldBooking = await prisma.booking.findUnique({ where: { id } });

  await prisma.booking.update({
    where: { id },
    data: {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: (formData.get('customerPhone') as string) || undefined,
      serviceType: formData.get('serviceType') as string,
      durationMinutes: parseInt(formData.get('durationMinutes') as string),
      price: parseInt(formData.get('price') as string),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      status: newStatus,
      paymentStatus: formData.get('paymentStatus') as string,
      notes: (formData.get('notes') as string) || undefined,
    },
  });

  // Existing email logic (kept as is)
  if (oldBooking && oldBooking.status !== newStatus) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    if (newStatus === 'confirmed') {
      await fetch(`${baseUrl}/api/send-booking-confirmed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.get('customerName'),
          customerEmail: formData.get('customerEmail'),
          serviceName: formData.get('serviceType'),
          bookingDate: formData.get('date'),
          bookingTime: formData.get('time'),
          braiderName: 'Our Team',
        }),
      });
    }

    if (newStatus === 'cancelled') {
      await fetch(`${baseUrl}/api/send-booking-canceled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.get('customerName'),
          customerEmail: formData.get('customerEmail'),
          serviceName: formData.get('serviceType'),
          bookingDate: formData.get('date'),
          bookingTime: formData.get('time'),
          braiderName: 'Our Team',
          cancellationReason: formData.get('notes') || 'No reason provided',
        }),
      });
    }

    if (newStatus === 'completed') {
      await fetch(`${baseUrl}/api/send-booking-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.get('customerName'),
          customerEmail: formData.get('customerEmail'),
          serviceName: formData.get('serviceType'),
          bookingDate: formData.get('date'),
          bookingTime: formData.get('time'),
          braiderName: 'Our Team',
        }),
      });
    }
  }

  revalidatePath('/admin/bookings');
}

async function deleteBooking(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.booking.delete({ where: { id } });
  revalidatePath('/admin/bookings');
}

async function getBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      serviceType: true,
      durationMinutes: true,
      price: true,
      date: true,
      time: true,
      status: true,
      paymentStatus: true,
      notes: true,
      createdAt: true,
      serviceId: true,
      staffUserId: true,
    },
  });
}

// Fetch active services for the dropdown
async function getServices() {
  return prisma.service.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      price: true,
      durationMinutes: true,
    },
  });
}

export default async function AdminBookingsSection() {
  const [bookings, services] = await Promise.all([
    getBookings(),
    getServices(),
  ]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Bookings</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} • Appointments & reservations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-500 hidden sm:inline">Click "New Booking" below</span>
        </div>
      </div>

      <AdminBookingTable
        bookings={bookings}
        services={services}                    {/* ← NEW: Pass services to the table */}
        onCreate={createBooking}
        onUpdate={updateBooking}
        onDelete={deleteBooking}
      />
    </div>
  );
}
