"use client";

export default function ProfileSection({ user }: { user: any }) {
  return (
    <div className="space-y-6">
      {/* Personal Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-medium mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60 block mb-2">Full Name</label>
            <input type="text" defaultValue={user.name} className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-black/60 block mb-2">Email</label>
            <input type="email" defaultValue={user.email} className="w-full border border-black/10 rounded-2xl px-4 py-4 text-sm" />
          </div>
        </div>
        <button className="mt-6 w-full sm:w-auto bg-black text-white px-8 py-4 rounded-2xl text-sm font-medium">
          Save Changes
        </button>
      </div>

      {/* Password & Security */}
      <div className="bg-white rounded-3xl p-6 sm:p-8">
        <h2 className="text-xl font-medium mb-6">Password &amp; Security</h2>
        <button className="w-full border border-black/20 py-4 rounded-2xl text-sm font-medium hover:bg-black/5">
          Change Password
        </button>
      </div>
    </div>
  );
}
