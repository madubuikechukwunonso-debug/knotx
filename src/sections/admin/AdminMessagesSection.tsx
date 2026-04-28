// src/sections/admin/AdminMessagesSection.tsx
import { getMessages } from './messages-actions';
import MessageConversationTabs from './MessageConversationTabs';

export default async function AdminMessagesSection() {
  const messages = await getMessages();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-emerald-950">Messages</h1>
          <p className="text-emerald-600 text-sm mt-1">
            {messages.length} customer conversation{messages.length !== 1 ? 's' : ''} • Tabbed inbox
          </p>
        </div>
        <div className="text-emerald-600 flex items-center gap-2 text-sm">
          <span>💬</span>
          <span>Each sender gets their own tab • End Chat clears the thread</span>
        </div>
      </div>

      {/* TABBED CONVERSATIONS */}
      <MessageConversationTabs messages={messages} />
    </div>
  );
}
