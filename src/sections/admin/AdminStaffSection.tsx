// src/sections/admin/AdminStaffSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Edit, Trash2, Calendar, User } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminStaffSection() {
  const staff = await prisma.staffProfile.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      displayName: true,
      bio: true,
      bookingEnabled: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Staff</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {staff.length} team member{staff.length !== 1 ? 's' : ''} • Manage your crew
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} />
          <span className="font-medium">Add New Staff Member</span>
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Staff Member</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Bio</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Booking Enabled</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Joined</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {staff.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-emerald-50 transition-colors group"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                        <User size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-emerald-950 truncate">{member.displayName}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-emerald-600 max-w-xs">
                    <p className="line-clamp-2 text-sm">{member.bio || '—'}</p>
                  </td>

                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${
                        member.bookingEnabled
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {member.bookingEnabled ? '✅ Enabled' : '❌ Disabled'}
                    </span>
                  </td>

                  <td className="px-6 py-5 text-emerald-600 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(member.createdAt).toLocaleDateString('en-CA')}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700"
                        title="Edit staff"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-3 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
                        title="Delete staff"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {staff.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-emerald-500">No staff members yet.</p>
            <p className="text-xs text-emerald-400 mt-2">
              Click “Add New Staff Member” or run the seed script to populate.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
