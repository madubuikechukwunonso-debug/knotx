// src/sections/admin/AdminGalleryTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight, Eye } from 'lucide-react';

type GalleryItem = {
  id: number;
  type: string;
  title: string | null;
  caption?: string | null;
  url: string;
  thumbnailUrl?: string | null;
  category: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

type Props = {
  items: GalleryItem[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
};

export default function AdminGalleryTable({
  items,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (editingItem) {
      formData.append('id', editingItem.id.toString());
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
    setModalOpen(false);
    setEditingItem(null);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this gallery item permanently?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await onDelete(formData);
      router.refresh();
    }
  };

  const handleToggle = async (item: GalleryItem) => {
    const formData = new FormData();
    formData.append('id', item.id.toString());
    await onToggleActive(formData);
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => {
          setEditingItem(null);
          setModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New Gallery Item
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">Preview</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Title</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Featured</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-black/5">
                <td className="px-6 py-4">
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title || 'Gallery item'}
                    className="h-12 w-12 rounded-2xl object-cover border border-black/10"
                  />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{item.title || 'Untitled gallery item'}</p>
                    {item.caption && (
                      <p className="text-xs text-black/50 line-clamp-1">{item.caption}</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm capitalize">{item.category}</td>
                <td className="px-6 py-4">
                  {item.isFeatured ? (
                    <span className="inline-flex items-center rounded-2xl bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
                      Featured
                    </span>
                  ) : (
                    <span className="text-xs text-black/40">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggle(item)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {item.isActive ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={item.isActive ? 'text-green-600' : 'text-gray-400'}>
                      {item.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setModalOpen(true);
                    }}
                    className="mr-3 text-black/70 hover:text-black"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
                {editingItem ? 'Edit Gallery Item' : 'New Gallery Item'}
              </h2>

              {editingItem && <input type="hidden" name="id" value={editingItem.id} />}

              <div>
                <label className="block text-xs font-medium mb-1">Type</label>
                <select
                  name="type"
                  defaultValue={editingItem?.type || 'image'}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                >
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  name="title"
                  defaultValue={editingItem?.title || ''}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Caption (optional)</label>
                <textarea
                  name="caption"
                  defaultValue={editingItem?.caption || ''}
                  rows={2}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Image URL</label>
                <input
                  name="url"
                  defaultValue={editingItem?.url}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Thumbnail URL (optional)</label>
                <input
                  name="thumbnailUrl"
                  defaultValue={editingItem?.thumbnailUrl || ''}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingItem?.category || 'general'}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Sort Order</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={editingItem?.sortOrder ?? 0}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    defaultChecked={editingItem?.isFeatured}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    defaultChecked={editingItem?.isActive !== false}
                  />
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-black/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-medium"
                >
                  {editingItem ? 'Save Changes' : 'Add to Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
