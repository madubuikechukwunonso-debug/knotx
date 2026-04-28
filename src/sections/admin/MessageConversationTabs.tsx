'use client';

import { useState } from 'react';
import { Reply, Trash2, User, MessageCircle } from 'lucide-react';
import { sendReply, endChat } from './messages-actions';

type Reply = {
  id: number;
  messageId: number;
  sentById: number;
  body: string;
  sentAt: Date;
};

type Message = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  createdAt: Date;
  read: boolean;
  status: string;
  lastRepliedAt: Date | null;
  replies: Reply[];
};

interface MessageConversationTabsProps {
  messages: Message[];
}

export default function MessageConversationTabs({ messages }: MessageConversationTabsProps) {
  // Group messages by email (unique conversation per sender)
  const conversations = messages.reduce((acc, msg) => {
    const key = msg.email.toLowerCase();
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(msg);
    return acc;
  }, {} as Record<string, Message[]>);

  const conversationList = Object.entries(conversations).map(([email, msgs]) => {
    const latest = msgs[0];
    return {
      email,
      name: latest.name,
      messageCount: msgs.length,
      latestMessage: latest,
      allMessages: msgs,
    };
  });

  const [activeEmail, setActiveEmail] = useState<string | null>(
    conversationList.length > 0 ? conversationList[0].email : null
  );

  const activeConversation = conversationList.find((c) => c.email === activeEmail);

  if (conversationList.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center">
        <User className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
        <p className="text-emerald-500 text-lg">No messages yet</p>
        <p className="text-emerald-400 text-sm mt-2">
          Customer inquiries from the contact form will appear here instantly
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* TABS SIDEBAR */}
      <div className="lg:w-80 flex-shrink-0">
        <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-emerald-100 bg-emerald-50">
            <p className="font-medium text-emerald-950 text-sm">Conversations ({conversationList.length})</p>
          </div>
          <div className="divide-y divide-emerald-100 max-h-[600px] overflow-y-auto">
            {conversationList.map((conv) => (
              <button
                key={conv.email}
                onClick={() => setActiveEmail(conv.email)}
                className={`w-full text-left px-5 py-4 transition-all flex items-start gap-3 ${
                  activeEmail === conv.email
                    ? 'bg-emerald-100 border-l-4 border-emerald-600'
                    : 'hover:bg-emerald-50'
                }`}
              >
                <div className="h-10 w-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  {conv.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-emerald-950 truncate">{conv.name}</p>
                    <span className="text-[10px] text-emerald-500 whitespace-nowrap ml-2">
                      {new Date(conv.latestMessage.createdAt).toLocaleDateString('en-CA')}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-600 truncate">{conv.email}</p>
                  <p className="text-xs text-emerald-500 mt-1 line-clamp-1">
                    {conv.latestMessage.subject || conv.latestMessage.message.substring(0, 60)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE CONVERSATION */}
      <div className="flex-1 min-w-0">
        {activeConversation ? (
          <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm flex flex-col h-[700px]">
            {/* Conversation Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-100 bg-emerald-50 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-xl font-medium">
                  {activeConversation.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-emerald-950 text-lg">{activeConversation.name}</p>
                  <p className="text-emerald-600 text-sm flex items-center gap-1">
                    <span className="font-mono text-xs bg-emerald-100 px-1.5 py-0.5 rounded">ID:</span> {activeConversation.email}
                  </p>
                </div>
              </div>

              {/* REDESIGNED END CHAT BUTTON – Mobile friendly */}
              <form action={endChat} className="flex-shrink-0">
                <input type="hidden" name="email" value={activeConversation.email} />
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-3xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-medium transition-colors sm:px-5 sm:py-2.5"
                  onClick={(e) => {
                    if (!confirm(`End chat with ${activeConversation.name} (${activeConversation.email})? This will permanently delete the entire conversation and all messages from this sender.`)) {
                      e.preventDefault();
                    }
                  }}
                >
                  <Trash2 size={16} />
                  <span className="hidden sm:inline">End Chat</span>
                  <span className="sm:hidden">End</span>
                </button>
              </form>
            </div>

            {/* Messages Thread (oldest first for natural chat flow) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#e5e7eb_0.8px,transparent_1px)] bg-[length:4px_4px]">
              {[...activeConversation.allMessages].reverse().flatMap((msg) => {
                const thread: React.ReactNode[] = [];
                // Original customer message
                thread.push(
                  <div key={`msg-${msg.id}`} className="flex justify-start">
                    <div className="max-w-[75%] bg-white border border-emerald-200 rounded-3xl rounded-tl-none p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-xs text-emerald-600 mb-1">
                        <span className="font-semibold">{msg.name}</span>
                        <span className="text-emerald-400">•</span>
                        <span>{new Date(msg.createdAt).toLocaleString('en-CA')}</span>
                      </div>
                      {msg.subject && <p className="font-medium text-emerald-950 mb-1">{msg.subject}</p>}
                      <p className="text-emerald-800 whitespace-pre-wrap text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
                // Replies
                msg.replies.forEach((reply) => {
                  const isAdmin = reply.sentById === 1;
                  thread.push(
                    <div key={`reply-${reply.id}`} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-3xl p-4 shadow-sm text-sm ${
                          isAdmin
                            ? 'bg-emerald-600 text-white rounded-br-none'
                            : 'bg-emerald-100 text-emerald-950 rounded-bl-none'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs mb-1 opacity-80">
                          <span className="font-semibold">{isAdmin ? 'You (Admin)' : msg.name}</span>
                          <span>•</span>
                          <span>{new Date(reply.sentAt).toLocaleString('en-CA')}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{reply.body}</p>
                      </div>
                    </div>
                  );
                });
                return thread;
              })}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-emerald-100 bg-white rounded-b-3xl">
              <form action={sendReply} className="flex gap-3">
                <input type="hidden" name="messageId" value={activeConversation.latestMessage.id} />
                <textarea
                  name="body"
                  rows={2}
                  placeholder="Type your reply..."
                  className="flex-1 rounded-3xl border border-emerald-200 px-5 py-3 text-sm focus:outline-none focus:border-emerald-500 resize-y min-h-[52px]"
                  required
                />
                <button
                  type="submit"
                  className="self-end bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-3xl flex items-center justify-center gap-2 text-sm font-medium h-[52px]"
                >
                  <Reply size={18} />
                  Send
                </button>
              </form>
              <p className="text-[10px] text-emerald-400 mt-2 text-center">Press Send to reply • End Chat clears this conversation permanently</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-emerald-100 p-12 text-center h-[700px] flex items-center justify-center">
            <div>
              <MessageCircle className="h-12 w-12 mx-auto text-emerald-300 mb-4" />
              <p className="text-emerald-500">Select a conversation from the left</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
