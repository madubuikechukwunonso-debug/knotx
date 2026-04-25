'use client';

import { useState } from "react";
import { User, Save, Lock } from "lucide-react";

export default function ProfileSection({ user }: { user: any }) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formData, setFormData] = useState({
    displayName: user.displayName || user.name || "",
    email: user.email || "",
  });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: formData.displayName,
          email: formData.email,
        }),
      });

      if (res.ok) {
        alert("✅ Profile updated successfully!");
        setEditing(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    alert("Password change feature coming soon (demo)");
    setShowPasswordForm(false);
    // In future: call /api/profile/change-password
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Personal Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-black/5">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-serif flex items-center gap-3">
            <User className="w-6 h-6 text-blue-600" />
            Personal Information
          </h2>
          <button
            onClick={() => (editing ? handleSaveProfile() : setEditing(true))}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-medium transition-colors"
          >
            {saving ? (
              "Saving..."
            ) : editing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              "Edit Profile"
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60 block mb-2">Full Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              disabled={!editing}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest text-black/60 block mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!editing}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500 disabled:bg-gray-50"
            />
          </div>
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
          <div className="mt-6 space-y-4">
            <input
              type="password"
              placeholder="Current password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm"
            />
            <input
              type="password"
              placeholder="New password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm"
            />
            <button
              onClick={handleChangePassword}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-medium"
            >
              Update Password
            </button>
          </div>
        )}

        <p className="text-xs text-black/50 text-center mt-4">
          Last changed: Never
        </p>
      </div>
    </div>
  );
}
