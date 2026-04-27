// src/sections/admin/AdminStaffSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Edit, UserCog, Calendar, Briefcase, Shield } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminStaffSection() {
  const staff = await prisma.staffProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          email: true,
          role: true,
          isActive: true,
        },
      },
      ServiceStaffAssignment: {
        include: { service: { select: { name: true } } },
      },
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Staff</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {staff.length} team member{staff.length !== 1 ? 's' : ''} • Limited admin powers
          </p>
        </div>

        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start">
          <Plus size={20} />
          <span className="font-medium">Add New Staff Member</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Staff Member</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Role</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Services</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Dashboard Access</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Bookings</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {staff.map((profile) => {
                const isAdmin = profile.user.role === 'admin' || profile.user.role === 'super_admin';
                return (
                  <tr key={profile.id} className="hover:bg-emerald-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-medium">
                          {profile.displayName?.[0] || 'S'}
                        </div>
                        <div>
                          <p className="font-medium text-emerald-950">{profile.displayName}</p>
                          <p className="text-xs text-emerald-500">{profile.user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-emerald-100 text-emerald-700">
                        {isAdmin ? 'ADMIN' : 'STAFF'}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-emerald-600 text-sm">
                      {profile.ServiceStaffAssignment.length > 0
                        ? profile.ServiceStaffAssignment.map((a) => a.service.name).join(', ')
                        : '—'}
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1 text-emerald-600">
                        <Shield size={16} />
                        <span className="text-xs">Limited</span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${profile.bookingEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {profile.bookingEnabled ? '✓ Enabled' : '✕ Disabled'}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700">
                        <Edit size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
