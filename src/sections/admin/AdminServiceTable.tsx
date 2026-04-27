// src/sections/admin/AdminServiceTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

type Service = {
  id: number;
  name: string;
  slug: string;
  price: number;
  durationMinutes: number;
  image?: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

type Props = {
  services: Service[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
};

export default function AdminServiceTable({
  services,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (editingService) {
      formData.append('id', editingService.id.toString());
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
    setModalOpen(false);
    setEditingService(null);
    router.refresh(); // instant UI update
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this service permanently?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await onDelete(formData);
      router.refresh();
    }
  };

  const handleToggle = async (service: Service) => {
    const formData = new FormData();
    formData.append('id', service.id.toString());
    formData.append('active', String(service.active));
    await onToggleActive(formData);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => {
          setEditingService(null);
          setModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New Service
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">Service</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Price</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Duration</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-black/5">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-xs text-black/50">/{service.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium">
                  ${(service.price / 100).toFixed(2)} CAD
                </td>
                <td className="px-6 py-4 text-sm text-black/70">
                  {service.durationMinutes} min
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggle(service)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {service.active ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={service.active ? 'text-green-600' : 'text-gray-400'}>
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setModalOpen(true);
                    }}
                    className="mr-3 text-black/70 hover:text-black"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-4 shadow-2xl">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif">
                {editingService ? 'Edit Service' : 'New Service'}
              </h2>

              <input type="hidden" name="id" value={editingService?.id} />

              <div>
                <label className="block text-xs font-medium mb-1">Service Name</label>
                <input
                  name="name"
                  defaultValue={editingService?.name}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingService?.description || ''}
                  rows={3}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (cents)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingService?.price}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Duration (minutes)</label>
                  <input
                    name="durationMinutes"
                    type="number"
                    defaultValue={editingService?.durationMinutes}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Image URL (optional)</label>
                <input
                  name="image"
                  defaultValue={editingService?.image || ''}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingService?.featured}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingService?.active !== false}
                  />
                  Active
                </label>
              </div>

              {editingService && (
                <div>
                  <label className="block text-xs font-medium mb-1">Sort Order</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={editingService.sortOrder}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingService(null);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-black/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-medium"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
