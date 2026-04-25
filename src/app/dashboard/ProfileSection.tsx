'use client';

import { useState } from "react";
import { User, Save, Lock } from "lucide-react";

export default function ProfileSection({ user }: { user: any }) {
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(user.displayName || user.name || "");
  const [email, setEmail] = useState(user.email || "");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Save Name
  const handleSaveName = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, displayName }),
      });
      if (res.ok) {
        alert("✅ Full name updated!");
        setEditingName(false);
      } else {
        alert("Failed to update name");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Save Email
  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, email }),
      });
      if (res.ok) {
        alert("✅ Email updated!");
        setEditingEmail(false);
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update email");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Password changed successfully!");
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.message || "Failed to change password");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
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
              disabled={saving}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {editingName ? "Save" : "Edit"}
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

        {/* Email */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs uppercase tracking-widest text-black/60">Email Address</label>
            <button
              onClick={() => (editingEmail ? handleSaveEmail() : setEditingEmail(true))}
              disabled={saving}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {editingEmail ? "Save" : "Edit"}
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

        <button
          onClick={() => setShowPasswordForm(!showPasswordForm)}
          className="w-full border border-black/20 py-4 rounded-2xl text-sm font-medium hover:bg-black/5 transition-colors flex items-center justify-center gap-3"
        >
          <Lock className="w-5 h-5" />
          Change Password
        </button>

        {showPasswordForm && (
          <div className="mt-6 space-y-4 border-t pt-6">
            <input
              type="password"
              placeholder="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm"
            />
            <input
              type="password"
              placeholder="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm"
            />

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-medium mt-2"
            >
              {saving ? "Updating Password..." : "Update Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
