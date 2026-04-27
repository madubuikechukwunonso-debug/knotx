// src/sections/admin/AdminUserTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

type User = {
  id: number;
  username: string;
  email: string;
  displayName?: string | null;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  blockedReason?: string | null;
  lastSignInAt?: Date | null;
  createdAt: Date;
};

type Props = {
  users: User[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
};

export default function AdminUserTable({
  users,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (editingUser) {
      formData.append('id', editingUser.id.toString());
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
    setModalOpen(false);
    setEditingUser(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this user permanently? This cannot be undone.')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await onDelete(formData);
      router.refresh();
    }
  };

  const handleToggle = async (user: User) => {
    const formData = new FormData();
    formData.append('id', user.id.toString());
    await onToggleActive(formData);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => {
          setEditingUser(null);
          setModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New User
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Last Sign-in</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-black/5">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{user.displayName || user.username}</p>
                    <p className="text-xs text-black/50">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-2xl bg-black/10 px-3 py-1 text-xs font-medium capitalize">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggle(user)}
                      className="flex items-center gap-1 text-xs"
                    >
                      {user.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400" />
                      )}
                      <span className={user.isActive ? 'text-green-600' : 'text-gray-400'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                    {user.isBlocked && (
                      <span className="inline-block rounded-2xl bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                        Blocked
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-black/60">
                  {user.lastSignInAt
                    ? new Date(user.lastSignInAt).toLocaleDateString()
                    : 'Never'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingUser(user);
                      setModalOpen(true);
                    }}
                    className="mr-3 text-black/70 hover:text-black"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-auto shadow-2xl">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif">
                {editingUser ? 'Edit User' : 'New User'}
              </h2>

              {editingUser && <input type="hidden" name="id" value={editingUser.id} />}

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1">Username</label>
                    <input
                      name="username"
                      required
                      className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Password (temporary)</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    />
                    <p className="text-xs text-black/50 mt-1">
                      In production this will be properly hashed with bcrypt
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium mb-1">Display Name</label>
                <input
                  name="displayName"
                  defaultValue={editingUser?.displayName || ''}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Role</label>
                <select
                  name="role"
                  defaultValue={editingUser?.role || 'user'}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingUser?.isActive !== false}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isBlocked"
                    defaultChecked={editingUser?.isBlocked}
                  />
                  Blocked
                </label>
              </div>

              {editingUser?.isBlocked && (
                <div>
                  <label className="block text-xs font-medium mb-1">Blocked Reason</label>
                  <input
                    name="blockedReason"
                    defaultValue={editingUser?.blockedReason || ''}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-black/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-medium"
                >
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
