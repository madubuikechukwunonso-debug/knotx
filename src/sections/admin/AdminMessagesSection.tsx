// src/sections/admin/AdminMessagesSection.tsx
import { PrismaClient } from '@prisma/client';
import { Mail, Eye, CheckCircle, Reply, MessageCircle } from 'lucide-react';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

// ====================== SERVER ACTIONS ======================
async function markAsRead(formData: FormData) {
  'use server';
  const id = parseInt(formData.get('id') as string, 10);
  await prisma.contactMessage.update({
    where: { id },
    data: { read: true, status: 'read' },
  });
  revalidatePath('/admin/messages');
}

async function replyToMessage(formData: FormData) {
  'use server';
  const messageId = parseInt(formData.get('messageId') as string, 10);
  const body = formData.get('body') as string;

  // Create reply
  await prisma.contactReply.create({
    data: {
      messageId,
      sentById: 1, // TODO: replace with real admin/staff user ID from session later
      body,
    },
  });

  // Update original message
  await prisma.contactMessage.update({
    where: { id: messageId },
    data: {
      read: true,
      status: 'replied',
      lastRepliedAt: new Date(),
    },
  });

  revalidatePath('/admin/messages');
}

export default async function AdminMessagesSection() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
    // replies relation removed because it is not defined in Prisma schema yet
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Messages</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {messages.length} customer message{messages.length !== 1 ? 's' : ''} • Direct support inbox
          </p>
        </div>

        <div className="text-emerald-600 flex items-center gap-2 text-sm">
          <MessageCircle size={18} />
          <span>Inbox • Real-time customer inquiries</span>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div className="space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className="bg-white rounded-3xl border border-emerald-100 shadow-sm p-5 hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Left info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 text-lg">
                    ✉️
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-emerald-950">{msg.name}</p>
                    <p className="text-emerald-600 text-sm truncate">{msg.email}</p>
                  </div>

                  <div className="text-right text-xs text-emerald-500 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString('en-CA')}
                  </div>
                </div>

                <h3 className="mt-4 font-medium text-emerald-950">{msg.subject || 'No subject'}</h3>
                <p className="text-emerald-700 mt-2 line-clamp-3 text-sm">{msg.message}</p>
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col items-end gap-3 sm:w-40">
                <span
                  className={`inline-flex items-center px-4 py-1 text-xs font-medium rounded-3xl ${
                    msg.status === 'replied'
                      ? 'bg-emerald-100 text-emerald-700'
                      : msg.status === 'read'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {msg.status.toUpperCase()}
                </span>

                <form action={markAsRead}>
                  <input type="hidden" name="id" value={msg.id} />
                  <button
                    type="submit"
                    className="flex items-center gap-2 text-emerald-700 hover:text-emerald-800 transition-colors text-sm"
                  >
                    <CheckCircle size={16} />
                    Mark as Read
                  </button>
                </form>

                {/* REPLY FORM */}
                <form action={replyToMessage} className="w-full">
                  <input type="hidden" name="messageId" value={msg.id} />
                  <textarea
                    name="body"
                    rows={3}
                    placeholder="Type your reply here..."
                    className="w-full rounded-3xl border border-emerald-200 px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 resize-none"
                    required
                  />
                  <button
                    type="submit"
                    className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-3xl flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <Reply size={18} />
                    Send Reply
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {messages.length === 0 && (
        <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center">
          <Mail className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
          <p className="text-emerald-500 text-lg">No messages yet</p>
          <p className="text-emerald-400 text-sm mt-2">
            Customer inquiries from the contact form will appear here
          </p>
        </div>
      )}
    </div>
  );
}
