// src/sections/admin/AdminServicesSection.tsx
"use client";

import { Plus, Edit, Trash2, DollarSign } from "lucide-react";

const services = [
  { id: 1, name: "Signature Knot Bracelet", price: 85, duration: "45 min", status: "Active" },
  { id: 2, name: "Custom Leather Wrap", price: 120, duration: "60 min", status: "Active" },
  // add more...
];

export default function AdminServicesSection() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-emerald-950">Services</h1>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors">
          <Plus size={20} /> Add Service
        </button>
      </div>

      {/* Responsive Table */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Service</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Price</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Duration</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Status</th>
                <th className="px-6 py-5 text-right font-medium text-emerald-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-5 font-medium">{service.name}</td>
                  <td className="px-6 py-5 flex items-center gap-1">
                    <DollarSign size={16} className="text-emerald-600" />{service.price}
                  </td>
                  <td className="px-6 py-5 text-emerald-600">{service.duration}</td>
                  <td className="px-6 py-5">
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-3xl text-xs font-medium">
                      {service.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right flex gap-2 justify-end">
                    <button className="p-2 hover:bg-emerald-100 rounded-2xl"><Edit size={18} /></button>
                    <button className="p-2 hover:bg-red-100 text-red-600 rounded-2xl"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
