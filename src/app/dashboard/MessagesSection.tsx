'use client';

import { useEffect, useState } from "react";

export default function MessagesSection() {
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages || []));
  }, []);

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <h2 className="text-2xl font-serif mb-6">Messages</h2>
      {messages.length === 0 ? (
        <p>No messages yet</p>
      ) : (
        messages.map((m) => <div key={m.id}>{m.message}</div>)
      )}
    </div>
  );
}
