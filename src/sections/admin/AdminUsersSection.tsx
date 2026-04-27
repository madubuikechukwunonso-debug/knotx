// src/sections/admin/AdminUsersSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Eye, UserX, UserCheck, Users } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminUsersSection() {
  const users = await prisma.localUser.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      isBlocked: true,
      blockedReason: true,
      createdAt: true,
      lastSignInAt: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Users</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {users.length} customer{users.length !== 1 ? 's' : ''} • Manage accounts
          </p>
        </div>

        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start">
          <Plus size={20} />
          <span className="font-medium">Invite New User</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Customer</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Email</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Role</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Status</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Joined</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-emerald-50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 font-medium text-sm">
                        {user.displayName?.[0] || user.username?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-emerald-950">
                          {user.displayName || user.username}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-emerald-600">{user.email}</td>

                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-emerald-100 text-emerald-700">
                      {user.role.toUpperCase()}
                    </span>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {user.isBlocked ? (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-red-100 text-red-700">
                          BLOCKED
                        </span>
                      ) : user.isActive ? (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-emerald-100 text-emerald-700">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-gray-100 text-gray-700">
                          INACTIVE
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-5 text-emerald-500 text-sm">
                    {new Date(user.createdAt).toLocaleDateString('en-CA')}
                  </td>

                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700">
                        <Eye size={18} />
                      </button>

                      {user.isBlocked ? (
                        <button className="p-3 hover:bg-emerald-100 text-emerald-700 rounded-2xl transition-colors">
                          <UserCheck size={18} />
                        </button>
                      ) : (
                        <button className="p-3 hover:bg-red-100 text-red-600 rounded-2xl transition-colors">
                          <UserX size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {users.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Users className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
            <p className="text-emerald-500 text-lg">No users yet</p>
            <p className="text-emerald-400 text-sm mt-2">
              Customers who register or are invited will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
