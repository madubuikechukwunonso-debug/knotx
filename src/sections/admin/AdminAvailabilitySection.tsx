// src/sections/admin/AdminAvailabilitySection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminAvailabilityTable from './AdminAvailabilityTable';

const prisma = new PrismaClient();

export default async function AdminAvailabilitySection() {
  const staff = await prisma.staffProfile.findMany({
    include: {
      workingHours: true,
      timeOffs: true,
      blockedSlots: true,
    },
    orderBy: { displayName: 'asc' },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Availability</h1>
          <p className="text-emerald-600 text-sm mt-1">
            Manage staff working hours, time off, and blocked slots
          </p>
        </div>
      </div>

      <AdminAvailabilityTable staff={staff} />
    </div>
  );
}
