'use client';

import { useState } from "react";
import { User, Save, Lock } from "lucide-react";

export default function ProfileSection({ user }: { user: any }) {
  const [savingName, setSavingName] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);

  const [displayName, setDisplayName] = useState(user.displayName || user.name || "");
  const [email, setEmail] = useState(user.email || "");

  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          displayName: displayName,
        }),
      });

      if (res.ok) {
        alert("✅ Full name updated successfully!");
        setEditingName(false);
      } else {
        alert("Failed to update name");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSavingName(false);
    }
  };

  const handleSaveEmail = async () => {
    setSavingEmail(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: email,
        }),
      });

      if (res.ok) {
        alert("✅ Email updated successfully!");
        setEditingEmail(false);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update email");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-black/5">
        <h2 className="text-2xl font-serif flex items-center gap-3 mb-8">
          <User className="w-6 h-6 text-blue-600" />
          Personal Information
        </h2>

        {/* Full Name */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase tracking-widest text-black/60">Full Name</label>
            <button
              onClick={() => (editingName ? handleSaveName() : setEditingName(true))}
              disabled={savingName}
              className="text-sm font-medium flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              {savingName ? (
                "Saving..."
              ) : editingName ? (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              ) : (
                "Edit"
              )}
            </button>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={!editingName}
            className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>

        {/* Email Address */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase tracking-widest text-black/60">Email Address</label>
            <button
              onClick={() => (editingEmail ? handleSaveEmail() : setEditingEmail(true))}
              disabled={savingEmail}
              className="text-sm font-medium flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              {savingEmail ? (
                "Saving..."
              ) : editingEmail ? (
                <>
                  <Save className="w-4 h-4" /> Save
                </>
              ) : (
                "Edit"
              )}
            </button>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={!editingEmail}
            className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      {/* Password & Security */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-black/5">
        <h2 className="text-2xl font-serif flex items-center gap-3 mb-6">
          <Lock className="w-6 h-6 text-blue-600" />
          Password &amp; Security
        </h2>
        <button className="w-full border border-black/20 py-4 rounded-2xl text-sm font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-3">
          <Lock className="w-5 h-5" />
          Change Password
        </button>
        <p className="text-xs text-black/50 text-center mt-4">
          Last changed: Never
        </p>
      </div>
    </div>
  );
}
