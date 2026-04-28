'use client';

import { useEffect, useState, useRef } from "react";

type Message = {
  id: number;
  name?: string;
  email?: string;
  subject?: string;
  message: string;
  createdAt: string;
  replies?: { id: number; body: string; sentAt: string }[];
};

export default function MessagesSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(data.messages || []);
    } catch (e) {
      console.error("Failed to load messages");
    }
  };

  // Load messages on mount + poll every 8 seconds for new admin replies
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 8000);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    setIsSending(true);

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: newMessage.trim(),
          // TODO: pass real user name/email from session if available
          name: "Website Visitor",
          email: "visitor@example.com",
        }),
      });

      setNewMessage("");
      await fetchMessages(); // refresh to show new message
    } catch (e) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-lg flex flex-col h-[560px]">
      <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
        Messages
      </h2>

      {/* Chat Area */}
      <div className="flex-1 bg-[#f8f5f0] rounded-3xl p-4 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-black/40 text-center">
            <div>
              <p className="text-sm">Your support inbox is empty</p>
              <p className="text-xs mt-1">Send a message to get started</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* User message */}
              <div className="flex justify-end">
                <div className="max-w-[75%] px-5 py-3 rounded-3xl text-sm bg-blue-600 text-white">
                  {msg.message}
                </div>
              </div>

              {/* Admin replies (real from database) */}
              {msg.replies?.map((reply) => (
                <div key={reply.id} className="flex justify-start">
                  <div className="max-w-[75%] px-5 py-3 rounded-3xl text-sm bg-white border border-black/10">
                    {reply.body}
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        {/* Typing / Sending Indicator */}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/10 px-5 py-3 rounded-3xl flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <span className="text-xs text-black/40">Admin is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !isSending && handleSend()}
          placeholder="Type your message to support..."
          className="flex-1 border border-black/10 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500"
          disabled={isSending}
        />
        <button
          onClick={handleSend}
          disabled={isSending || !newMessage.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 rounded-3xl text-sm font-medium transition-colors"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
