'use client';

import { useState } from 'react';
import { Plus, Eye, UserX, UserCheck, Users, Edit2, Trash2, X } from 'lucide-react';

interface User {
  id: number;
  displayName: string | null;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
  isBlocked: boolean;
  blockedReason: string | null;
  createdAt: Date | string;
  lastSignInAt: Date | string | null;
}

interface AdminUsersSectionProps {
  users: User[];
}

export default function AdminUsersSection({ users: initialUsers }: AdminUsersSectionProps) {
  const [users, setUsers] = useState(initialUsers);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [updating, setUpdating] = useState(false);

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    displayName: '',
    password: '',
    role: 'user',
  });

  const [editUser, setEditUser] = useState({
    displayName: '',
    email: '',
    role: '',
  });

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      displayName: user.displayName || '',
      email: user.email,
      role: user.role,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
    setNewUser({ username: '', email: '', displayName: '', password: '', role: 'user' });
    setEditUser({ displayName: '', email: '', role: '' });
  };

  // Block/Unblock User
  const toggleBlockUser = async (user: User) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          isBlocked: !user.isBlocked,
          blockedReason: !user.isBlocked ? 'Blocked by admin' : null,
        }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === user.id 
            ? { ...u, isBlocked: !u.isBlocked, blockedReason: !u.isBlocked ? 'Blocked by admin' : null }
            : u
        ));
      } else {
        alert('Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling block status:', error);
      alert('Failed to update user status');
    } finally {
      setUpdating(false);
    }
  };

  // Change User Role
  const changeUserRole = async (userId: number, newRole: string) => {
    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, role: newRole } : u
        ));
      } else {
        alert('Failed to change user role');
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('Failed to change user role');
    } finally {
      setUpdating(false);
    }
  };

  // Delete User
  const deleteUser = async () => {
    if (!selectedUser) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedUser.id }),
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
        closeModals();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    } finally {
      setUpdating(false);
    }
  };

  // Edit User
  const updateUser = async () => {
    if (!selectedUser) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedUser.id,
          displayName: editUser.displayName,
          email: editUser.email,
          role: editUser.role,
        }),
      });

      if (response.ok) {
        setUsers(prev => prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, displayName: editUser.displayName, email: editUser.email, role: editUser.role }
            : u
        ));
        closeModals();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  // Add New User
  const addNewUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Username, email, and password are required');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers(prev => [createdUser, ...prev]);
        closeModals();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setUpdating(false);
    }
  };

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

        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
        >
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
                        <p className="text-xs text-emerald-500">@{user.username}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5 text-emerald-600">{user.email}</td>

                  <td className="px-6 py-5">
                    <select
                      value={user.role}
                      onChange={(e) => changeUserRole(user.id, e.target.value)}
                      disabled={updating}
                      className="text-xs font-medium px-3 py-1 rounded-3xl bg-emerald-100 text-emerald-700 border-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="user">USER</option>
                      <option value="worker">WORKER</option>
                      <option value="admin">ADMIN</option>
                      <option value="super_admin">SUPER ADMIN</option>
                    </select>
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
                    <div className="flex items-center gap-1 justify-end">
                      <button 
                        onClick={() => openEditModal(user)}
                        className="p-2 hover:bg-emerald-100 rounded-xl transition-colors text-emerald-600"
                        title="Edit User"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button 
                        onClick={() => toggleBlockUser(user)}
                        disabled={updating}
                        className={`p-2 rounded-xl transition-colors ${
                          user.isBlocked 
                            ? 'hover:bg-emerald-100 text-emerald-600' 
                            : 'hover:bg-red-100 text-red-600'
                        }`}
                        title={user.isBlocked ? 'Unblock User' : 'Block User'}
                      >
                        {user.isBlocked ? <UserCheck size={16} /> : <UserX size={16} />}
                      </button>

                      <button 
                        onClick={() => openDeleteModal(user)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
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

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100">
              <h3 className="text-xl font-semibold text-emerald-950">Invite New User</h3>
              <button onClick={closeModals} className="p-2 hover:bg-emerald-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Username</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="johndoe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={newUser.displayName}
                  onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Role</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="user">User</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100">
              <button
                onClick={closeModals}
                className="flex-1 px-6 py-3 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={addNewUser}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {updating ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full">
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100">
              <h3 className="text-xl font-semibold text-emerald-950">Edit User</h3>
              <button onClick={closeModals} className="p-2 hover:bg-emerald-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={editUser.displayName}
                  onChange={(e) => setEditUser({ ...editUser, displayName: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-700 mb-1">Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  className="w-full rounded-2xl border border-emerald-200 px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="user">User</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-emerald-100">
              <button
                onClick={closeModals}
                className="flex-1 px-6 py-3 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {updating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-emerald-950 text-center mb-2">Delete User?</h3>
            <p className="text-emerald-600 text-center mb-6">
              Are you sure you want to delete <strong>{selectedUser.displayName || selectedUser.username}</strong>? 
              This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeModals}
                className="flex-1 px-6 py-3 border border-emerald-200 text-emerald-700 rounded-2xl text-sm font-medium hover:bg-emerald-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                disabled={updating}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 disabled:opacity-50"
              >
                {updating ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
