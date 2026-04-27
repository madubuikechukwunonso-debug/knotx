// src/sections/admin/AdminServicesSection.tsx
import { PrismaClient } from '@prisma/client';
import { Plus, Edit, Trash2, DollarSign } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminServicesSection() {
  const services = await prisma.service.findMany({
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      price: true,
      durationMinutes: true,
      active: true,
      featured: true,
      image: true,
    },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Services</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {services.length} service{services.length !== 1 ? 's' : ''} • Manage offerings
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm w-full sm:w-auto justify-center sm:justify-start"
        >
          <Plus size={20} />
          <span className="font-medium">Add New Service</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Service</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Price</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Duration</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700 whitespace-nowrap">Status</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {services.map((service) => (
                <tr
                  key={service.id}
                  className="hover:bg-emerald-50 transition-colors group"
                >
                  {/* Service Name + Image */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="h-10 w-10 object-cover rounded-2xl border border-emerald-200"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-emerald-950 truncate">{service.name}</p>
                        {service.featured && (
                          <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-px rounded-xl inline-block mt-1">
                            Featured
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-1 font-semibold text-emerald-950">
                      <DollarSign size={16} className="text-emerald-600" />
                      {(service.price / 100).toFixed(2)}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-6 py-5 text-emerald-600 font-medium">
                    {service.durationMinutes} min
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${
                        service.active
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {service.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        className="p-3 hover:bg-emerald-100 rounded-2xl transition-colors text-emerald-700"
                        title="Edit service"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        className="p-3 hover:bg-red-100 text-red-600 rounded-2xl transition-colors"
                        title="Delete service"
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
        {services.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-emerald-500">No services found in the database yet.</p>
            <p className="text-xs text-emerald-400 mt-2">Click “Add New Service” to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
