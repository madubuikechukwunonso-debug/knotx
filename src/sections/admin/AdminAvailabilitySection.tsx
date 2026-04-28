// src/sections/admin/AdminAvailabilitySection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminAvailabilityTable from './AdminAvailabilityTable';
import { getCurrentUser } from '@/lib/auth'; // adjust path if needed

const prisma = new PrismaClient();

export default async function AdminAvailabilitySection() {
  const currentUser = await getCurrentUser(); // assumes you have this helper

  // Get or create a StaffProfile for the current admin
  let adminStaff = null;
  if (currentUser) {
    adminStaff = await prisma.staffProfile.findFirst({
      where: { userId: currentUser.id },
      include: {
        workingHours: true,
        timeOffs: true,
        blockedSlots: true,
      },
    });

    if (!adminStaff) {
      // Auto-create a staff profile for the admin so they can set their own hours
      adminStaff = await prisma.staffProfile.create({
        data: {
          userId: currentUser.id,
          displayName: currentUser.name || currentUser.email || "Admin",
          bookingEnabled: true,
        },
        include: {
          workingHours: true,
          timeOffs: true,
          blockedSlots: true,
        },
      });
    }
  }

  // Get all other staff (excluding the admin's own profile)
  const otherStaff = await prisma.staffProfile.findMany({
    where: adminStaff ? { id: { not: adminStaff.id } } : {},
    include: {
      workingHours: true,
      timeOffs: true,
      blockedSlots: true,
    },
    orderBy: { displayName: 'asc' },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Availability</h1>
          <p className="text-emerald-600 text-sm mt-1">
            Manage your personal hours + team schedules
          </p>
        </div>
      </div>

      {/* ADMIN'S PERSONAL AVAILABILITY */}
      {adminStaff && (
        <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl">
              👑
            </div>
            <div>
              <h2 className="font-semibold text-lg">My Availability (Admin)</h2>
              <p className="text-xs text-emerald-600">You are always available for bookings</p>
            </div>
          </div>

          <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700 mb-3">
              Click the button below to set your personal working hours. This is separate from team staff.
            </p>
            <a 
              href="#admin-hours" 
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl text-sm font-medium transition-colors"
            >
              Edit My Working Hours →
            </a>
          </div>
        </div>
      )}

      {/* TEAM STAFF AVAILABILITY */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-medium">Team Staff Availability</h2>
            <p className="text-xs text-black/50">Other staff members and their schedules</p>
          </div>
          <div className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-2xl">
            {otherStaff.length} team member{otherStaff.length !== 1 ? 's' : ''}
          </div>
        </div>

        <AdminAvailabilityTable staff={otherStaff} />
      </div>

      {/* ADMIN'S PERSONAL HOURS EDITOR (shown when clicking the button above) */}
      {adminStaff && (
        <div id="admin-hours" className="pt-8 border-t">
          <h3 className="text-lg font-medium mb-4">Edit Your Personal Working Hours</h3>
          <AdminAvailabilityTable staff={[adminStaff]} />
        </div>
      )}
    </div>
  );
}
