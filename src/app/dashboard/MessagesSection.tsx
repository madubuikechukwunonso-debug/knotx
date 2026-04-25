'use client';

import { useEffect, useState, useRef } from "react";

export default function MessagesSection() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []))
      .catch(() => {});
  }, []);

  // Scroll to bottom when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Simulate receiving a reply from admin/staff
  const simulateAdminReply = (userMessage: string) => {
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const replies = [
        "Thank you for your message! We'll get back to you shortly.",
        "Got it! Our team has been notified.",
        "Perfect, we'll handle this for you.",
        "Thanks for reaching out. How can we help you today?",
      ];

      const randomReply = replies[Math.floor(Math.random() * replies.length)];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          isAdmin: true,
          message: randomReply,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 1800);
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      isAdmin: false,
      message: newMessage,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setNewMessage("");

    // Simulate admin typing & reply
    simulateAdminReply(newMessage);
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
            <div
              key={msg.id}
              className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[75%] px-5 py-3 rounded-3xl text-sm ${
                  msg.isAdmin
                    ? "bg-white border border-black/10"
                    : "bg-blue-600 text-white"
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-black/10 px-5 py-3 rounded-3xl flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-black/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
              <span className="text-xs text-black/40">Admin is typing...</span>
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
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type your message to support..."
          className="flex-1 border border-black/10 rounded-3xl px-6 py-4 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-3xl text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
