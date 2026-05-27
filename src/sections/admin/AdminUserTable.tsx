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
        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" />
        New User
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">User</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-muted-foreground">Last Sign-in</th>
              <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">{user.displayName || user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-block rounded-2xl bg-muted px-3 py-1 text-xs font-medium capitalize text-foreground">
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
                      <span className="inline-block rounded-2xl bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        Blocked
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
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
                    className="mr-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="text-red-500 hover:text-red-600 transition-colors"
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
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full mx-auto shadow-2xl">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif text-foreground">
                {editingUser ? 'Edit User' : 'New User'}
              </h2>

              {editingUser && <input type="hidden" name="id" value={editingUser.id} />}

              {!editingUser && (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Username</label>
                    <input
                      name="username"
                      required
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-muted-foreground">Password (temporary)</label>
                    <input
                      name="password"
                      type="password"
                      required
                      className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      In production this will be properly hashed with bcrypt
                    </p>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Display Name</label>
                <input
                  name="displayName"
                  defaultValue={editingUser?.displayName || ''}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  required
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Role</label>
                <select
                  name="role"
                  defaultValue={editingUser?.role || 'user'}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-foreground">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingUser?.isActive !== false}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-foreground">
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
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Blocked Reason</label>
                  <input
                    name="blockedReason"
                    defaultValue={editingUser?.blockedReason || ''}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground"
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
                  className="flex-1 py-4 rounded-2xl border border-border font-medium hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
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
