"use client";

import { useState } from "react";
import { Calendar, Clock, User, MessageSquare, RotateCcw, X } from "lucide-react";

export default function BookingsSection() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8">
      <h2 className="text-2xl font-medium mb-6">My Bookings</h2>

      {/* Tab Switcher */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "upcoming" ? "border-black text-black" : "border-transparent text-black/50"
          }`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`flex-1 py-4 text-sm font-medium border-b-2 transition-all ${
            activeTab === "past" ? "border-black text-black" : "border-transparent text-black/50"
          }`}
        >
          Past Appointments
        </button>
      </div>

      {activeTab === "upcoming" ? (
        <div className="space-y-6">
          {/* Upcoming Booking Card */}
          <div className="border border-black/10 rounded-3xl p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-black/60">March 28, 2025 • 10:00 AM</p>
                <h3 className="text-lg font-medium mt-1">Knotless Braids (Medium)</h3>
                <p className="text-sm text-black/70">Stylist: Sarah A.</p>
              </div>
              <div className="text-right">
                <span className="text-xs bg-green-100 text-green-700 px-4 py-1 rounded-3xl">Confirmed</span>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>4 days 12 hrs left</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={18} />
                <span>Sarah A.</span>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <button className="py-4 text-xs sm:text-sm border border-black/20 rounded-2xl hover:bg-black/5">
                Add Note
              </button>
              <button className="py-4 text-xs sm:text-sm border border-black/20 rounded-2xl hover:bg-black/5">
                Reschedule
              </button>
              <button className="py-4 text-xs sm:text-sm border border-red-300 text-red-600 rounded-2xl hover:bg-red-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 text-black/50">
          Your past appointments and result photos will appear here.
        </div>
      )}
    </div>
  );
}
