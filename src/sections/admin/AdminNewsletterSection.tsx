// src/sections/admin/AdminNewsletterSection.tsx
import { PrismaClient } from '@prisma/client';
import { Mail, Plus, Send, Users, TrendingUp } from 'lucide-react';

const prisma = new PrismaClient();

export default async function AdminNewsletterSection() {
  const subscribers = await prisma.subscriber.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      source: true,
      isActive: true,
      unsubscribedAt: true,
      createdAt: true,
      localUser: {
        select: { displayName: true },
      },
    },
  });

  const total = subscribers.length;
  const active = subscribers.filter(s => s.isActive).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Newsletter</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {total} subscriber{total !== 1 ? 's' : ''} • Grow your audience
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm">
            <Send size={20} />
            <span className="font-medium">Send New Campaign</span>
          </button>

          <button className="flex items-center gap-2 bg-white border border-emerald-200 hover:border-emerald-300 text-emerald-700 px-6 py-3 rounded-3xl transition-colors">
            <Plus size={20} />
            <span className="font-medium">Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-600 text-sm">Total Subscribers</p>
              <p className="text-4xl font-semibold text-emerald-950 mt-2">{total}</p>
            </div>
            <Users className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-600 text-sm">Active Subscribers</p>
              <p className="text-4xl font-semibold text-emerald-950 mt-2">{active}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-emerald-100 md:col-span-1 col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-600 text-sm">From Homepage</p>
              <p className="text-xl font-medium text-emerald-950 mt-2">
                {subscribers.filter(s => s.source === 'HOMEPAGE').length}
              </p>
            </div>
            <Mail className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* SUBSCRIBERS TABLE */}
      <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-emerald-50">
              <tr>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Name</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Email</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Source</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Joined</th>
                <th className="px-6 py-5 text-left font-medium text-emerald-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-5 font-medium text-emerald-950">
                    {sub.name || sub.localUser?.displayName || '—'}
                  </td>
                  <td className="px-6 py-5 text-emerald-600">{sub.email}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-emerald-100 text-emerald-700">
                      {sub.source}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-emerald-500 text-sm">
                    {new Date(sub.createdAt).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${
                        sub.isActive
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {sub.isActive ? 'ACTIVE' : 'UNSUBSCRIBED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {subscribers.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Mail className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
            <p className="text-emerald-500 text-lg">No subscribers yet</p>
            <p className="text-emerald-400 text-sm mt-2">
              Subscribers from registration and homepage will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
