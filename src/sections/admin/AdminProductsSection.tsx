// src/sections/admin/AdminProductsSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Edit, Trash2, DollarSign, Package } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminProductsSection() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      price: true,
      inventory: true,        // ← Fixed: this is the correct field in your schema
      active: true,
      featured: true,
      image: true,
      category: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Products</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {products.length} product{products.length !== 1 ? 's' : ''} • Inventory & catalog
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} />
          <span className="font-medium">Add New Product</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Product</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Category</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Price</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Inventory</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Status</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-emerald-50 transition-colors group"
                >
                  {/* Product Name + Image */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 object-cover rounded-2xl border border-emerald-200"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-emerald-950 truncate">{product.name}</p>
                        {product.featured && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-px rounded-xl inline-block mt-1">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-5 text-emerald-600 font-medium">
                    {product.category || '—'}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 font-semibold text-emerald-950">
                      <DollarSign size={16} className="text-emerald-600" />
                      {(product.price / 100).toFixed(2)}
                    </div>
                  </td>

                  {/* Inventory (was previously called "stock") */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-emerald-600" />
                      <span
                        className={`font-medium ${
                          product.inventory <= 5
                            ? 'text-red-600'
                            : 'text-emerald-700'
                        }`}
                      >
                        {product.inventory} left
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${
                        product.active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700"
                        title="Edit product"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-3 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
                        title="Delete product"
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
        {products.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-emerald-500">No products found in the database yet.</p>
            <p className="text-xs text-emerald-400 mt-2">Click “Add New Product” to start building your catalog.</p>
          </div>
        )}
      </div>
    </div>
  );
}
