// src/sections/admin/AdminServiceTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

type Service = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  depositAmount: number;           // ← NEW
  durationMinutes: number;
  image: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openModal = (service: Service | null = null) => {
    setEditingService(service);
    setPreviewUrl(null);
    setModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Image is too large! Maximum size is 8 MB.');
        e.target.value = '';
        return;
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (editingService) {
      formData.append('id', editingService.id.toString());
      if (editingService.image) {
        formData.append('currentImage', editingService.image);
      }
    }

    if (editingService) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setModalOpen(false);
    setEditingService(null);
    setPreviewUrl(null);
    router.refresh();
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
        type="button"
        onClick={() => openModal(null)}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New Service
      </button>

      {/* MOBILE OPTIMIZED TABLE */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-3xl border border-black/10 bg-white">
        <table className="w-full min-w-[700px] sm:min-w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Service</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Full Price</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Deposit</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Duration</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Status</th>
              <th className="px-4 py-4 text-right text-xs font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {services.map((service) => (
              <tr key={service.id} className="hover:bg-black/5">
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    {service.image && (
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-10 h-10 object-cover rounded-xl flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{service.name}</p>
                      <p className="text-xs text-black/50">/{service.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 font-medium sm:px-6">
                  ${(service.price / 100).toFixed(2)} CAD
                </td>
                <td className="px-4 py-4 font-medium text-emerald-600 sm:px-6">
                  ${(service.depositAmount / 100).toFixed(2)} CAD
                </td>
                <td className="px-4 py-4 text-sm font-medium sm:px-6">
                  {service.durationMinutes} min
                </td>
                <td className="px-4 py-4 sm:px-6">
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
                <td className="px-4 py-4 text-right sm:px-6">
                  <button
                    onClick={() => openModal(service)}
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
            {services.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-black/50">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif">
                {editingService ? 'Edit Service' : 'New Service'}
              </h2>

              {editingService && <input type="hidden" name="id" value={editingService.id} />}

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-xs font-medium mb-2">Service Image</label>

                {editingService?.image && !previewUrl && (
                  <div className="mb-3">
                    <p className="text-xs text-black/60 mb-1">Current Image:</p>
                    <img
                      src={editingService.image}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded-2xl border border-black/10"
                    />
                  </div>
                )}

                {previewUrl && (
                  <div className="mb-3">
                    <p className="text-xs text-black/60 mb-1">New Image Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-2xl border border-black/10"
                    />
                  </div>
                )}

                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-black file:text-white hover:file:bg-black/90 cursor-pointer"
                />
                <p className="text-xs text-black/50 mt-2">
                  {editingService
                    ? 'Leave empty to keep current image • Max 8 MB'
                    : 'Recommended: 1200×1200 px • Max 8 MB'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Service Name</label>
                <input
                  name="name"
                  defaultValue={editingService?.name || ''}
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

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Full Price (cents)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingService?.price ?? 0}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Deposit Amount (cents) – charged via Stripe</label>
                  <input
                    name="depositAmount"
                    type="number"
                    defaultValue={editingService?.depositAmount ?? 0}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Duration (minutes)</label>
                <input
                  name="durationMinutes"
                  type="number"
                  defaultValue={editingService?.durationMinutes ?? 60}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingService?.featured || false}
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

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setModalOpen(false);
                    setEditingService(null);
                    setPreviewUrl(null);
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
