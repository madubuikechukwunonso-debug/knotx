'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Staff = {
  id: number;
  displayName: string;
  bio: string | null;
  bookingEnabled: boolean;
  createdAt: Date;
};

export default function AdminStaffSection({ initialStaff = [] }: { initialStaff?: Staff[] }) {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    bookingEnabled: true,
  });
  const [loading, setLoading] = useState(false);

  // Load initial staff data from API if no initialStaff was provided (e.g. when used in AdminSubPage)
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const response = await fetch('/api/admin/staff');
        if (response.ok) {
          const data = await response.json();
          if (data.ok && Array.isArray(data.staff)) {
            setStaff(data.staff);
          }
        }
      } catch (error) {
        console.error('Failed to load staff:', error);
      }
    };

    if (initialStaff.length === 0) {
      loadStaff();
    }
  }, [initialStaff]);

  const openCreateModal = () => {
    setFormData({ displayName: '', bio: '', bookingEnabled: true });
    setShowCreateModal(true);
  };

  const openEditModal = (member: Staff) => {
    setSelectedStaff(member);
    setFormData({
      displayName: member.displayName,
      bio: member.bio || '',
      bookingEnabled: member.bookingEnabled,
    });
    setShowEditModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedStaff(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const newStaff = data.staff || data; // handle both {ok, staff} or direct object
        setStaff([newStaff, ...staff]);
        closeModals();
        router.refresh();
      } else {
        alert('Failed to create staff member');
      }
    } catch (error) {
      alert('Error creating staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedStaff = data.staff || data;
        setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s));
        closeModals();
        router.refresh();
      } else {
        alert('Failed to update staff member');
      }
    } catch (error) {
      alert('Error updating staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/staff/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStaff(staff.filter(s => s.id !== id));
        router.refresh();
      } else {
        alert('Failed to delete staff member');
      }
    } catch (error) {
      alert('Error deleting staff member');
    } finally {
      setLoading(false);
    }
  };

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
          onClick={openCreateModal}
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
                <tr key={member.id} className="hover:bg-emerald-50 transition-colors group">
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
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${member.bookingEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {member.bookingEnabled ? 'Enabled' : 'Disabled'}
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
                        onClick={() => openEditModal(member)}
                        className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700"
                        title="Edit staff"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
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
              Click “Add New Staff Member” to get started.
            </p>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Add New Staff Member</h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Sarah Chen"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  rows={3}
                  placeholder="Short description..."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bookingEnabled"
                  checked={formData.bookingEnabled}
                  onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600"
                />
                <label htmlFor="bookingEnabled" className="text-sm text-gray-700">
                  Enable booking for this staff member
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-2xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedStaff && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Staff Member</h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio (optional)</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="editBookingEnabled"
                  checked={formData.bookingEnabled}
                  onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                  className="w-4 h-4 text-emerald-600"
                />
                <label htmlFor="editBookingEnabled" className="text-sm text-gray-700">
                  Enable booking for this staff member
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModals}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-2xl hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
