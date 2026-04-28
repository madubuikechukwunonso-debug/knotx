// src/sections/admin/AdminNewsletterSection.tsx
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { Mail, Plus, Send, Users, TrendingUp, X } from 'lucide-react';

const prisma = new PrismaClient();

// ====================== SERVER ACTIONS ======================
async function createCampaign(formData: FormData) {
  'use server';

  const subject = formData.get('subject') as string;
  const htmlBody = formData.get('htmlBody') as string;

  if (!subject || !htmlBody) return;

  // Create campaign
  const campaign = await prisma.newsletterCampaign.create({
    data: {
      subject,
      htmlBody,
      audienceType: 'all',
      sendToEveryone: true,
      createdById: 1, // TODO: replace with real admin ID from session
    },
  });

  // Get all active subscribers
  const activeSubscribers = await prisma.subscriber.findMany({
    where: { isActive: true },
    select: { email: true, name: true },
  });

  // Create recipient records
  await prisma.newsletterRecipient.createMany({
    data: activeSubscribers.map((sub) => ({
      campaignId: campaign.id,
      email: sub.email,
      name: sub.name || undefined,
      deliveryStatus: 'pending',
    })),
  });

  revalidatePath('/admin/newsletter');
}

async function addSubscriber(formData: FormData) {
  'use server';

  const email = formData.get('email') as string;
  const name = formData.get('name') as string || undefined;
  const source = (formData.get('source') as string) || 'MANUAL';

  if (!email) return;

  await prisma.subscriber.upsert({
    where: { email },
    update: { name, isActive: true, unsubscribedAt: null },
    create: {
      email,
      name,
      source: source as any,
      isActive: true,
    },
  });

  revalidatePath('/admin/newsletter');
}

export default async function AdminNewsletterSection() {
  // Fetch from both sources
  const [subscribers, localUsers] = await Promise.all([
    prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        isActive: true,
        unsubscribedAt: true,
        createdAt: true,
        localUser: { select: { displayName: true } },
      },
    }),
    prisma.localUser.findMany({
      where: { email: { not: null } },
      select: {
        id: true,
        email: true,
        displayName: true,
        createdAt: true,
      },
    }),
  ]);

  // Merge into unified list
  const contacts = [
    ...subscribers.map((s) => ({
      id: `sub-${s.id}`,
      email: s.email,
      name: s.name || s.localUser?.displayName || '—',
      source: s.source,
      isActive: s.isActive,
      joined: s.createdAt,
      type: 'subscriber' as const,
    })),
    ...localUsers
      .filter((u) => !subscribers.some((s) => s.email === u.email))
      .map((u) => ({
        id: `user-${u.id}`,
        email: u.email!,
        name: u.displayName || '—',
        source: 'REGISTRATION' as const,
        isActive: true,
        joined: u.createdAt,
        type: 'user' as const,
      })),
  ].sort((a, b) => b.joined.getTime() - a.joined.getTime());

  const total = contacts.length;
  const active = contacts.filter((c) => c.isActive).length;
  const fromHomepage = contacts.filter((c) => c.source === 'HOMEPAGE').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Newsletter</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {total} contact{total !== 1 ? 's' : ''} • Registration + Homepage signups
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* SEND CAMPAIGN BUTTON + MODAL */}
          <form action={createCampaign} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const modal = document.getElementById('campaign-modal') as HTMLDialogElement;
                modal?.showModal();
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-3xl transition-colors shadow-sm"
            >
              <Send size={20} />
              <span className="font-medium">Send New Campaign</span>
            </button>

            {/* Campaign Modal */}
            <dialog id="campaign-modal" className="rounded-3xl p-0 shadow-2xl max-w-lg w-full">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">New Campaign</h2>
                  <button type="button" onClick={() => (document.getElementById('campaign-modal') as HTMLDialogElement)?.close()}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <input name="subject" required className="w-full rounded-2xl border border-emerald-200 px-4 py-3" placeholder="Exciting news from Knotx & Krafts!" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">HTML Body</label>
                    <textarea name="htmlBody" rows={8} required className="w-full rounded-2xl border border-emerald-200 px-4 py-3 font-mono text-sm" placeholder="<h1>Hello...</h1>" />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => (document.getElementById('campaign-modal') as HTMLDialogElement)?.close()} className="flex-1 py-3 rounded-3xl border">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-3xl bg-emerald-600 text-white">Send to {active} Subscribers</button>
                </div>
              </div>
            </dialog>
          </form>

          {/* ADD SUBSCRIBER BUTTON + MODAL */}
          <form action={addSubscriber} className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                const modal = document.getElementById('add-subscriber-modal') as HTMLDialogElement;
                modal?.showModal();
              }}
              className="flex items-center gap-2 bg-white border border-emerald-200 hover:border-emerald-300 text-emerald-700 px-6 py-3 rounded-3xl transition-colors"
            >
              <Plus size={20} />
              <span className="font-medium">Add Subscriber</span>
            </button>

            {/* Add Subscriber Modal */}
            <dialog id="add-subscriber-modal" className="rounded-3xl p-0 shadow-2xl max-w-md w-full">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-serif">Add New Subscriber</h2>
                  <button type="button" onClick={() => (document.getElementById('add-subscriber-modal') as HTMLDialogElement)?.close()}>
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email Address</label>
                    <input name="email" type="email" required className="w-full rounded-2xl border border-emerald-200 px-4 py-3" placeholder="hello@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Name (optional)</label>
                    <input name="name" className="w-full rounded-2xl border border-emerald-200 px-4 py-3" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Source</label>
                    <select name="source" className="w-full rounded-2xl border border-emerald-200 px-4 py-3">
                      <option value="MANUAL">Manual Entry</option>
                      <option value="HOMEPAGE">Homepage</option>
                      <option value="REGISTRATION">Registration</option>
                      <option value="CHECKOUT">Checkout</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => (document.getElementById('add-subscriber-modal') as HTMLDialogElement)?.close()} className="flex-1 py-3 rounded-3xl border">Cancel</button>
                  <button type="submit" className="flex-1 py-3 rounded-3xl bg-emerald-600 text-white">Add Subscriber</button>
                </div>
              </div>
            </dialog>
          </form>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-6 border border-emerald-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-600 text-sm">Total Contacts</p>
              <p className="text-4xl font-semibold text-emerald-950 mt-2">{total}</p>
            </div>
            <Users className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-emerald-100">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-600 text-sm">Active</p>
              <p className="text-4xl font-semibold text-emerald-950 mt-2">{active}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-emerald-100 md:col-span-1 col-span-2">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-emerald-600 text-sm">From Homepage</p>
              <p className="text-xl font-medium text-emerald-950 mt-2">{fromHomepage}</p>
            </div>
            <Mail className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* CONTACTS TABLE (merged from both sources) */}
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
              {contacts.map((contact, index) => (
                <tr key={contact.id} className="hover:bg-emerald-50 transition-colors">
                  <td className="px-6 py-5 font-medium text-emerald-950">{contact.name}</td>
                  <td className="px-6 py-5 text-emerald-600">{contact.email}</td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl bg-emerald-100 text-emerald-700">
                      {contact.source}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-emerald-500 text-sm">
                    {new Date(contact.joined).toLocaleDateString('en-CA')}
                  </td>
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-3xl ${contact.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {contact.isActive ? 'ACTIVE' : 'UNSUBSCRIBED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contacts.length === 0 && (
          <div className="px-6 py-16 text-center">
            <Mail className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
            <p className="text-emerald-500 text-lg">No contacts yet</p>
            <p className="text-emerald-400 text-sm mt-2">Subscribers from registration and homepage will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
