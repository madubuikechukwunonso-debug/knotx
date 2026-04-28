// src/sections/admin/AdminBookingsSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminBookingTable from './AdminBookingTable';
import { Plus } from 'lucide-react';

const prisma = new PrismaClient();

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
    },
  });
}

// ====================== SERVER ACTIONS ======================
async function createBooking(formData: FormData) {
  'use server';

  await prisma.booking.create({
    data: {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: (formData.get('customerPhone') as string) || undefined,
      serviceType: formData.get('serviceType') as string,
      durationMinutes: parseInt(formData.get('durationMinutes') as string),
      price: parseInt(formData.get('price') as string),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      status: formData.get('status') as string,
      paymentStatus: formData.get('paymentStatus') as string,
      notes: (formData.get('notes') as string) || undefined,
    },
  });

  revalidatePath('/admin/bookings');
}

async function updateBooking(formData: FormData) {
  'use server';

  const id = parseInt(formData.get('id') as string);

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
      status: formData.get('status') as string,
      paymentStatus: formData.get('paymentStatus') as string,
      notes: (formData.get('notes') as string) || undefined,
    },
  });

  revalidatePath('/admin/bookings');
}

async function deleteBooking(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string);
  await prisma.booking.delete({ where: { id } });
  revalidatePath('/admin/bookings');
}

export default async function AdminBookingsSection() {
  const bookings = await getBookings();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Bookings</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {bookings.length} booking{bookings.length !== 1 ? 's' : ''} • Appointments & reservations
          </p>
        </div>

        {/* The button is now inside AdminBookingTable — but we keep a visual header button for consistency */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-500 hidden sm:inline">Click “New Booking” below</span>
        </div>
      </div>

      {/* FULLY WIRED TABLE + MODAL */}
      <AdminBookingTable
        bookings={bookings}
        onCreate={createBooking}
        onUpdate={updateBooking}
        onDelete={deleteBooking}
      />
    </div>
  );
}
