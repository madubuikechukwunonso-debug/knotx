// src/sections/admin/AdminAvailabilitySection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import AdminAvailabilityTable from './AdminAvailabilityTable';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

// Get current logged-in user from session cookie (adjust if you use different auth)
async function getCurrentAdmin() {
  const cookieStore = await headers();
  const userCookie = cookieStore.get('user');
  
  if (!userCookie) return null;
  
  try {
    return JSON.parse(userCookie);
  } catch {
    return null;
  }
}

export default async function AdminAvailabilitySection() {
  const currentUser = await getCurrentAdmin();

  // Try to find existing StaffProfile for this admin
  let myProfile = null;
  if (currentUser?.id) {
    myProfile = await prisma.staffProfile.findFirst({
      where: { userId: currentUser.id },
      include: {
        workingHours: true,
        timeOffs: true,
        blockedSlots: true,
      },
    });
  }

  // Get all other staff
  const otherStaff = await prisma.staffProfile.findMany({
    where: myProfile ? { id: { not: myProfile.id } } : {},
    include: {
      workingHours: true,
      timeOffs: true,
      blockedSlots: true,
    },
    orderBy: { displayName: 'asc' },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Availability</h1>
          <p className="text-emerald-600 text-sm mt-1">
            Manage your personal hours + team schedules
          </p>
        </div>
      </div>

      {/* ADMIN'S PERSONAL AVAILABILITY */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-600 text-white rounded-2xl flex items-center justify-center text-xl">
            👑
          </div>
          <div>
            <h2 className="font-semibold text-lg">My Availability (Admin)</h2>
            <p className="text-xs text-emerald-600">Set your personal working hours and nickname</p>
          </div>
        </div>

        {!myProfile ? (
          // NO PROFILE YET - Show creation form with nickname
          <div className="bg-emerald-50/50 rounded-2xl p-6 border border-emerald-100">
            <h3 className="font-medium text-emerald-950 mb-3">Activate Your Staff Profile</h3>
            <p className="text-sm text-emerald-700 mb-4">
              Create your staff profile so customers can book appointments with you directly. 
              Choose any nickname you want to appear on the booking page.
            </p>
            
            <form action={async (formData: FormData) => {
              'use server';
              const displayName = formData.get('displayName') as string;
              const userId = currentUser?.id;
              
              if (!userId || !displayName) return;

              // Create StaffProfile
              const newProfile = await prisma.staffProfile.create({
                data: {
                  userId,
                  displayName,
                  bookingEnabled: true,
                },
              });

              // Create default working hours (Mon-Fri 8am-10pm, Sat 2-7pm, Sun closed)
              await prisma.staffWorkingHour.createMany({
                data: [
                  { staffUserId: newProfile.id, dayOfWeek: 1, startTime: '08:00', endTime: '22:00', isWorking: true },
                  { staffUserId: newProfile.id, dayOfWeek: 2, startTime: '08:00', endTime: '22:00', isWorking: true },
                  { staffUserId: newProfile.id, dayOfWeek: 3, startTime: '08:00', endTime: '22:00', isWorking: true },
                  { staffUserId: newProfile.id, dayOfWeek: 4, startTime: '08:00', endTime: '22:00', isWorking: true },
                  { staffUserId: newProfile.id, dayOfWeek: 5, startTime: '08:00', endTime: '22:00', isWorking: true },
                  { staffUserId: newProfile.id, dayOfWeek: 6, startTime: '14:00', endTime: '19:00', isWorking: true },
                  { staffUserId: newProfile.id, dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isWorking: false },
                ],
              });

              revalidatePath('/admin/availability');
            }}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" 
                  name="displayName" 
                  placeholder="Your nickname (e.g. Chukwunonso, Owner, Master Stylist)"
                  className="flex-1 border border-black/20 px-4 py-3 rounded-2xl focus:border-emerald-500 outline-none"
                  required 
                />
                <button 
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-2xl font-medium whitespace-nowrap"
                >
                  Create My Profile
                </button>
              </div>
              <p className="text-xs text-emerald-600 mt-2">This nickname will appear on the booking page for customers to choose you</p>
            </form>
          </div>
        ) : (
          // HAS PROFILE - Show editor
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-medium text-emerald-950">{myProfile.displayName}</div>
                <div className="text-xs text-emerald-600">Your personal schedule • Appears on booking page</div>
              </div>
              <div className={`px-3 py-1 text-xs rounded-2xl ${myProfile.bookingEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {myProfile.bookingEnabled ? 'Accepting Bookings' : 'Not Available'}
              </div>
            </div>

            <AdminAvailabilityTable staff={[myProfile]} />
          </div>
        )}
      </div>

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
    </div>
  );
}
