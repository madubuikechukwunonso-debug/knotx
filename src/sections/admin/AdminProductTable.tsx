// src/sections/admin/AdminProductTable.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  category: string;
  inventory: number;
  image?: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

type Props = {
  products: Product[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
};

export default function AdminProductTable({
  products,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSubmit = async (formData: FormData) => {
    if (editingProduct) {
      formData.append('id', editingProduct.id.toString());
      await onUpdate(formData);
    } else {
      await onCreate(formData);
    }
    setModalOpen(false);
    setEditingProduct(null);
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
        onClick={() => {
          setEditingProduct(null);
          setModalOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-sm font-medium text-white hover:bg-black/90"
      >
        <Plus className="h-4 w-4" />
        New Product
      </button>

      {/* Table */}
      <div className="rounded-3xl border border-black/10 bg-white overflow-hidden">
        <table className="w-full">
          <thead className="bg-black/5">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium">Product</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Category</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Price</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Inventory</th>
              <th className="px-6 py-4 text-left text-xs font-medium">Status</th>
              <th className="px-6 py-4 text-right text-xs font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-black/5">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-xs text-black/50">/{product.slug}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm capitalize">{product.category}</td>
                <td className="px-6 py-4 font-medium">
                  ${(product.price / 100).toFixed(2)} CAD
                </td>
                <td className="px-6 py-4 text-sm font-medium">{product.inventory}</td>
                <td className="px-6 py-4">
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
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setModalOpen(true);
                    }}
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
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full mx-auto shadow-2xl">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif">
                {editingProduct ? 'Edit Product' : 'New Product'}
              </h2>

              {editingProduct && <input type="hidden" name="id" value={editingProduct.id} />}

              <div>
                <label className="block text-xs font-medium mb-1">Product Name</label>
                <input
                  name="name"
                  defaultValue={editingProduct?.name}
                  required
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingProduct?.description || ''}
                  rows={3}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Price (cents)</label>
                  <input
                    name="price"
                    type="number"
                    defaultValue={editingProduct?.price}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <input
                    name="category"
                    defaultValue={editingProduct?.category || 'general'}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1">Inventory</label>
                  <input
                    name="inventory"
                    type="number"
                    defaultValue={editingProduct?.inventory ?? 0}
                    required
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Image URL (optional)</label>
                  <input
                    name="image"
                    defaultValue={editingProduct?.image || ''}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    defaultChecked={editingProduct?.featured}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={editingProduct?.active !== false}
                  />
                  Active
                </label>
              </div>

              {editingProduct && (
                <div>
                  <label className="block text-xs font-medium mb-1">Sort Order</label>
                  <input
                    name="sortOrder"
                    type="number"
                    defaultValue={editingProduct.sortOrder}
                    className="w-full rounded-2xl border border-black/10 px-4 py-3"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingProduct(null);
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
