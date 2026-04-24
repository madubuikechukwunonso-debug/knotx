"use client";

export default function MessagesSection() {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl font-medium mb-6">Messages</h2>
      <div className="border border-black/10 rounded-3xl p-8 text-center py-16">
        <p className="text-black/60">Your support inbox</p>
        <p className="text-xs text-black/40 mt-2">Messages from admin and staff will appear here</p>
      </div>
    </div>
  );
}
