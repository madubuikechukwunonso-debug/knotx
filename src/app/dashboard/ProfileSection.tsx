'use client';
import { useState } from "react";
import { User, Save, Lock, MapPin } from "lucide-react";

export default function ProfileSection({ user }: { user: any }) {
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingShipping, setEditingShipping] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState(user.displayName || user.name || "");
  const [email, setEmail] = useState(user.email || "");

  // Shipping address form (initialized from user prop)
  const [shippingForm, setShippingForm] = useState({
    shippingAddressLine1: user.shippingAddressLine1 || "",
    shippingAddressLine2: user.shippingAddressLine2 || "",
    shippingCity: user.shippingCity || "",
    shippingState: user.shippingState || "",
    shippingPostalCode: user.shippingPostalCode || "",
    shippingCountry: user.shippingCountry || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Use correct ID from session (userId) or fallback to id
  const userId = user.userId || user.id;

  // Save Name
  const handleSaveName = async () => {
    if (!displayName.trim()) return alert("Name cannot be empty");
    if (!userId) return alert("User ID is missing. Please log in again.");
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, displayName }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Full name updated successfully!");
        setEditingName(false);
      } else {
        alert(data.message || "Failed to update name");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Save Email
  const handleSaveEmail = async () => {
    if (!email.trim()) return alert("Email cannot be empty");
    if (!userId) return alert("User ID is missing. Please log in again.");
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, email }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Email updated successfully!");
        setEditingEmail(false);
      } else {
        alert(data.message || "Failed to update email");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Save Shipping Address (NEW — uses dedicated endpoint)
  const handleSaveShipping = async () => {
    if (!shippingForm.shippingAddressLine1.trim()) {
      return alert("Address Line 1 is required");
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile/shipping", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shippingForm),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Shipping address updated successfully!");
        setEditingShipping(false);
      } else {
        alert(data.message || "Failed to update shipping address");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert("All password fields are required");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }
    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
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
    } catch (err) {
      console.error(err);
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

      {/* SHIPPING ADDRESS — NEW SECTION */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-black/5">
        <h2 className="text-2xl font-serif flex items-center gap-3 mb-8">
          <MapPin className="w-6 h-6 text-blue-600" />
          Shipping Address
        </h2>

        {editingShipping ? (
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-black/60 mb-2">Address Line 1</label>
              <input
                type="text"
                value={shippingForm.shippingAddressLine1}
                onChange={(e) => setShippingForm({ ...shippingForm, shippingAddressLine1: e.target.value })}
                className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-black/60 mb-2">Address Line 2 (optional)</label>
              <input
                type="text"
                value={shippingForm.shippingAddressLine2}
                onChange={(e) => setShippingForm({ ...shippingForm, shippingAddressLine2: e.target.value })}
                className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Apartment, suite, etc."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-black/60 mb-2">City</label>
                <input
                  type="text"
                  value={shippingForm.shippingCity}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingCity: e.target.value })}
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-black/60 mb-2">Province / State</label>
                <input
                  type="text"
                  value={shippingForm.shippingState}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingState: e.target.value })}
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-black/60 mb-2">Postal Code</label>
                <input
                  type="text"
                  value={shippingForm.shippingPostalCode}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingPostalCode: e.target.value })}
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-black/60 mb-2">Country</label>
                <input
                  type="text"
                  value={shippingForm.shippingCountry}
                  onChange={(e) => setShippingForm({ ...shippingForm, shippingCountry: e.target.value })}
                  className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Canada"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSaveShipping}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Shipping Address"}
              </button>
              <button
                onClick={() => setEditingShipping(false)}
                disabled={saving}
                className="flex-1 border border-black/20 py-4 rounded-2xl text-sm font-medium hover:bg-black/5"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            {shippingForm.shippingAddressLine1 ? (
              <div className="text-sm text-black/70 space-y-1">
                <p className="font-medium">{shippingForm.shippingAddressLine1}</p>
                {shippingForm.shippingAddressLine2 && <p>{shippingForm.shippingAddressLine2}</p>}
                <p>
                  {shippingForm.shippingCity}, {shippingForm.shippingState} {shippingForm.shippingPostalCode}
                </p>
                <p className="font-medium">{shippingForm.shippingCountry}</p>
              </div>
            ) : (
              <p className="text-black/40 italic">No shipping address saved yet</p>
            )}

            <button
              onClick={() => setEditingShipping(true)}
              className="mt-6 w-full border border-black/20 py-4 rounded-2xl text-sm font-medium hover:bg-black/5 transition-colors"
            >
              Edit Shipping Address
            </button>
          </div>
        )}
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
