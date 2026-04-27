// src/sections/admin/AdminBookingsSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminBookingTable from './AdminBookingTable';

const prisma = new PrismaClient();

async function getBookings() {
  return prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });
}

// Server Actions
async function createBooking(formData: FormData) {
  'use server';

  await prisma.booking.create({
    data: {
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string || undefined,
      serviceType: formData.get('serviceType') as string,
      durationMinutes: parseInt(formData.get('durationMinutes') as string),
      price: parseInt(formData.get('price') as string),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      status: formData.get('status') as string,
      paymentStatus: formData.get('paymentStatus') as string,
      notes: formData.get('notes') as string || undefined,
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
      customerPhone: formData.get('customerPhone') as string || undefined,
      serviceType: formData.get('serviceType') as string,
      durationMinutes: parseInt(formData.get('durationMinutes') as string),
      price: parseInt(formData.get('price') as string),
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      status: formData.get('status') as string,
      paymentStatus: formData.get('paymentStatus') as string,
      notes: formData.get('notes') as string || undefined,
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
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-serif text-4xl tracking-tight">Bookings</h1>
          <p className="text-black/60">Manage all customer appointments and reservations</p>
        </div>
        <AdminBookingTable
          bookings={bookings}
          onCreate={createBooking}
          onUpdate={updateBooking}
          onDelete={deleteBooking}
        />
      </div>
    </div>
  );
}
