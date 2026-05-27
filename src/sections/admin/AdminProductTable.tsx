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
  productCategoryId?: number | null;
  productCategory?: { id: number; name: string } | null;
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

type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  _count?: { products: number };
};

type Props = {
  products: Product[];
  productCategories: ProductCategory[];
  onCreate: (formData: FormData) => Promise<void>;
  onUpdate: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  onToggleActive: (formData: FormData) => Promise<void>;
};

export default function AdminProductTable({
  products,
  productCategories,
  onCreate,
  onUpdate,
  onDelete,
  onToggleActive,
}: Props) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const openModal = (product: Product | null = null) => {
    setEditingProduct(product);
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
    if (editingProduct) {
      formData.append('id', editingProduct.id.toString());
      if (editingProduct.image) formData.append('currentImage', editingProduct.image);
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
        onClick={() => openModal(null)} 
        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Plus className="h-4 w-4" /> New Product
      </button>

      <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-3xl border border-border bg-card">
        <table className="w-full min-w-[640px] sm:min-w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6 text-muted-foreground">Product</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6 text-muted-foreground">Category</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6 text-muted-foreground">Price</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6 text-muted-foreground">Inventory</th>
              <th className="px-4 py-4 text-left text-xs font-medium sm:px-6 text-muted-foreground">Status</th>
              <th className="px-4 py-4 text-right text-xs font-medium sm:px-6 text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    {product.image && <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-xl flex-shrink-0 border border-border" />}
                    <div className="min-w-0">
                      <p className="font-medium truncate text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm capitalize sm:px-6 text-foreground">
                  {product.productCategory?.name || 'Uncategorized'}
                </td>
                <td className="px-4 py-4 font-medium sm:px-6 text-foreground">${(product.price / 100).toFixed(2)} CAD</td>
                <td className="px-4 py-4 text-sm font-medium sm:px-6 text-foreground">{product.inventory}</td>
                <td className="px-4 py-4 sm:px-6">
                  <button onClick={() => handleToggle(product)} className="flex items-center gap-1 text-xs">
                    {product.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-gray-400" />}
                    <span className={product.active ? 'text-green-600' : 'text-gray-400'}>{product.active ? 'Active' : 'Inactive'}</span>
                  </button>
                </td>
                <td className="px-4 py-4 text-right sm:px-6">
                  <button onClick={() => openModal(product)} className="mr-3 text-muted-foreground hover:text-foreground transition-colors"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-600 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-muted-foreground">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-3xl max-w-lg w-full mx-auto shadow-2xl max-h-[90vh] overflow-y-auto">
            <form action={handleSubmit} className="p-8 space-y-6">
              <h2 className="text-2xl font-serif text-foreground">{editingProduct ? 'Edit Product' : 'New Product'}</h2>

              {/* IMAGE */}
              <div>
                <label className="block text-xs font-medium mb-2 text-muted-foreground">Product Image</label>
                {editingProduct?.image && !previewUrl && <img src={editingProduct.image} alt="Current" className="w-32 h-32 object-cover rounded-2xl border border-border mb-3" />}
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-32 h-32 object-cover rounded-2xl border border-border mb-3" />}
                <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="w-full text-sm file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer" />
              </div>

              {/* NAME */}
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Product Name</label>
                <input name="name" defaultValue={editingProduct?.name || ''} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Hair Beads Pack" />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Description</label>
                <textarea name="description" defaultValue={editingProduct?.description || ''} rows={3} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" placeholder="Premium hair styling beads..." />
              </div>

              {/* PRICE & INVENTORY */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Price (in cents)</label>
                  <input name="price" type="number" defaultValue={editingProduct?.price ?? 0} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" placeholder="2500" />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1 text-muted-foreground">Inventory</label>
                  <input name="inventory" type="number" defaultValue={editingProduct?.inventory ?? 0} required className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" placeholder="50" />
                </div>
              </div>

              {/* PRODUCT CATEGORY DROPDOWN */}
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Shop Category</label>
                <select name="productCategoryId" defaultValue={editingProduct?.productCategoryId?.toString() || ''} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground">
                  <option value="">Uncategorized</option>
                  {productCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">Categories are separate from booking service categories</p>
              </div>

              {/* SORT ORDER */}
              <div>
                <label className="block text-xs font-medium mb-1 text-muted-foreground">Sort Order</label>
                <input name="sortOrder" type="number" defaultValue={editingProduct?.sortOrder ?? 0} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-foreground" />
              </div>

              {/* CHECKBOXES */}
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-foreground">
                  <input type="checkbox" name="featured" defaultChecked={editingProduct?.featured || false} />
                  <span className="text-sm">Featured</span>
                </label>
                <label className="flex items-center gap-2 text-foreground">
                  <input type="checkbox" name="active" defaultChecked={editingProduct?.active !== false} />
                  <span className="text-sm">Active</span>
                </label>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setModalOpen(false); setEditingProduct(null); setPreviewUrl(null); }} 
                  className="flex-1 py-4 rounded-2xl border border-border font-medium hover:bg-muted text-foreground"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 rounded-2xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
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
