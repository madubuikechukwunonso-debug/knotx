'use client';

import { useState } from "react";
import { prisma } from "@/lib/prisma"; // not needed here - we'll use server actions later

export default function ProfileSection({ user }: { user: any }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user.displayName || "",
    email: user.email || "",
  });

  const handleSave = async () => {
    // In a real app, use a server action here
    alert("Profile updated (demo - connect to Prisma in production)");
    setEditing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-lg">
      <h2 className="text-2xl font-serif mb-6">Edit Profile</h2>
      {/* Add form fields here - for now a simple placeholder */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm mb-1">Display Name</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full border rounded-2xl px-4 py-3"
            disabled={!editing}
          />
        </div>
        <button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          className="bg-blue-600 text-white px-8 py-3 rounded-2xl"
        >
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}
