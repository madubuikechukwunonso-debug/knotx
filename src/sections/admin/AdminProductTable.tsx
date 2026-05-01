// src/sections/admin/AdminProductTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  priceCurrency?: string;
  category: string;
  categoryId?: number | null;
  categoryRel?: { id: number; name: string } | null;
  inventory: number;
  image: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
};

type Props = {
  products: Product[];
  categories: Category[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
};

export default function AdminProductTable({
  products,
  categories,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCreateCategory, setShowCreateCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
    setPreviewUrl(null);
    setShowCreateCategory(false);
    setNewCategoryName('');
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
    if (editingProduct) {
      formData.append('id', editingProduct.id.toString());
      if (editingProduct.image) {
        formData.append('currentImage', editingProduct.image);
      }
    }

    if (editingProduct) {
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setModalOpen(false);
    setEditingProduct(null);
    setPreviewUrl(null);
    setShowCreateCategory(false);
    router.refresh();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Delete this product permanently?')) {
      const formData = new FormData();
      formData.append('id', id.toString());
      await onDelete(formData);
      router.refresh();
    }
  };

  const handleToggle = async (product: Product) => {
    const formData = new FormData();
    formData.append('id', product.id.toString());
    formData.append('active', String(product.active));
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
        New Product
      </button>

      {/* MOBILE OPTIMIZED TABLE */}
      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-3xl border border-black/10 bg-white">
        <table className="w-full min-w-[640px] sm:min-w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Product</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Category</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Price</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Inventory</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6">Status</th>
              <th className="px-4 py-4 text-right text-xs font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-black/5">
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    {product.image && (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded-xl flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-xs text-black/50">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm capitalize sm:px-6">
                  {product.categoryRel?.name || product.category || 'general'}
                </td>
                <td className="px-4 py-4 font-medium sm:px-6">
                  ${(product.price / 100).toFixed(2)} CAD
                </td>
                <td className="px-4 py-4 text-sm font-medium sm:px-6">{product.inventory}</td>
                <td className="px-4 py-4 sm:px-6">
                  <button
                    onClick={() => handleToggle(product)}
                    className="flex items-center gap-1 text-xs"
                  >
                    {product.active ? (
                      <ToggleRight className="h-5 w-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={product.active ? 'text-green-600' : 'text-gray-400'}>
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </button>
                </td>
                <td className="px-4 py-4 text-right sm:px-6">
                  <button
                    onClick={() => openModal(product)}
                    className="mr-3 text-black/70 hover:text-black"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-black/50">
                  No products yet.
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
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-xs font-medium mb-2">Product Image</label>

                {editingProduct?.image && !previewUrl && (
                  <div className="mb-3">
                    <p className="text-xs text-black/60 mb-1">Current Image:</p>
                    <img
                      src={editingProduct.image}
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
                  {editingProduct
                    ? 'Leave empty to keep current image • Max 8 MB'
                    : 'Tap to take photo or choose from gallery • Max 8 MB'}
                </p>
              </div>

              {/* NAME */}
              <div>
                <label className="block text-xs font-medium mb-1">Product Name</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name || ''}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  placeholder="Hair Beads Pack"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  rows={3}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  placeholder="Premium hair styling beads..."
                />
              </div>

              {/* PRICE & INVENTORY */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (in cents)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingProduct?.price ?? 0}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="2500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Inventory</label>
                  <input
                    name="inventory"
                    type="number"
                    defaultValue={editingProduct?.inventory ?? 0}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                    placeholder="50"
                  />
                </div>
              </div>

              {/* CATEGORY DROPDOWN */}
              <div>
                <label className="block text-xs font-medium mb-1">Category</label>
                <div className="flex gap-2">
                  <select
                    name="categoryId"
                    defaultValue={editingProduct?.categoryId?.toString() || ''}
                    className="flex-1 rounded-2xl border border-black/10 px-4 py-3"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCreateCategory(!showCreateCategory)}
                    className="px-4 py-3 border border-black/20 rounded-2xl text-sm hover:bg-black/5"
                  >
                    + New
                  </button>
                </div>

                {/* INLINE CREATE CATEGORY */}
                {showCreateCategory && (
                  <div className="mt-3 p-4 bg-emerald-50 rounded-2xl">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newCategoryName.trim()) return;
                          const formData = new FormData();
                          formData.append('name', newCategoryName.trim());
                          // Note: This would need a server action to create category
                          // For now, alert and close
                          alert('Please create category from Admin Products page first, then refresh.');
                          setNewCategoryName('');
                          setShowCreateCategory(false);
                        }}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium"
                      >
                        Create
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SORT ORDER */}
              <div>
                <label className="block text-xs font-medium mb-1">Sort Order</label>
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={editingProduct?.sortOrder ?? 0}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              {/* CHECKBOXES */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProduct?.featured || false}
                  />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingProduct?.active !== false}
                  />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl) URL.revokeObjectURL(previewUrl);
                    setModalOpen(false);
                    setEditingProduct(null);
                    setPreviewUrl(null);
                    setShowCreateCategory(false);
                  }}
                  className="flex-1 py-4 rounded-2xl border border-black/10 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-black text-white font-medium"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
