'use client';

import { useState, useEffect } from "react";
import { Calendar, Clock, User, MessageSquare, RotateCcw, X } from "lucide-react";

export default function BookingsSection() {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [pastBookings, setPastBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  // Fetch real bookings
  useEffect(() => {
    fetch("/api/booking/mine")
      .then((r) => r.json())
      .then((d) => {
        const allBookings = d.bookings || [];

        const upcoming = allBookings.filter((b: any) =>
          b.status === "pending" || b.status === "confirmed"
        );
        const past = allBookings.filter((b: any) =>
          b.status === "completed" || b.status === "cancelled"
        );

        setUpcomingBookings(upcoming);
        setPastBookings(past);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const refreshBookings = () => {
    window.location.reload(); // Simple refresh - you can improve this later
  };

  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    await fetch(`/api/booking/${bookingId}/cancel`, { method: "POST" });
    refreshBookings();
  };

  const handleAddNote = (bookingId: number) => {
    const note = prompt("Add a note for your stylist (e.g. 'Bringing my own extensions'):");
    if (note) {
      fetch(`/api/booking/${bookingId}/note`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      alert("Note sent to stylist!");
    }
  };

  const handleReschedule = (booking: any) => {
    setReschedulingId(booking.id);
    setNewDate(booking.date);
    setNewTime(booking.time);
  };

  const submitReschedule = async () => {
    if (!reschedulingId || !newDate || !newTime) return;

    const res = await fetch(`/api/booking/${reschedulingId}/reschedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: newDate, time: newTime }),
    });

    if (res.ok) {
      alert("Booking rescheduled successfully!");
      setReschedulingId(null);
      refreshBookings();
    } else {
      alert("Failed to reschedule booking");
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-lg">
        <h2 className="text-2xl font-medium mb-6">My Bookings</h2>
        <p className="text-black/40">Loading your bookings...</p>
      </div>
    );
  }

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
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-12 text-black/50">
              No upcoming bookings
            </div>
          ) : (
            upcomingBookings.map((booking) => (
              <div key={booking.id} className="border border-black/10 rounded-3xl p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-black/60">
                      {booking.date} • {booking.time}
                    </p>
                    <h3 className="text-lg font-medium mt-1 capitalize">
                      {booking.serviceType}
                    </h3>
                    <p className="text-sm text-black/70">
                      Stylist: {booking.staffName || "To be assigned"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-green-100 text-green-700 px-4 py-1 rounded-3xl">
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>Countdown active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    <span>{booking.staffName || "—"}</span>
                  </div>
                </div>

                {/* Reschedule Form (shown when user clicks Reschedule) */}
                {reschedulingId === booking.id && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-4">
                    <p className="text-sm font-medium mb-3">Reschedule this booking</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs block mb-1">New Date</label>
                        <input
                          type="date"
                          value={newDate}
                          onChange={(e) => setNewDate(e.target.value)}
                          className="w-full border rounded-2xl px-4 py-3 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs block mb-1">New Time</label>
                        <input
                          type="time"
                          value={newTime}
                          onChange={(e) => setNewTime(e.target.value)}
                          className="w-full border rounded-2xl px-4 py-3 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={submitReschedule}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-2xl text-sm font-medium"
                      >
                        Confirm Reschedule
                      </button>
                      <button
                        onClick={() => setReschedulingId(null)}
                        className="flex-1 border border-black/20 py-3 rounded-2xl text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-8 grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleAddNote(booking.id)}
                    className="py-4 text-xs sm:text-sm border border-black/20 rounded-2xl hover:bg-black/5 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} />
                    Add Note
                  </button>

                  <button
                    onClick={() => handleReschedule(booking)}
                    className="py-4 text-xs sm:text-sm border border-black/20 rounded-2xl hover:bg-black/5 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={16} />
                    Reschedule
                  </button>

                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="py-4 text-xs sm:text-sm border border-red-300 text-red-600 rounded-2xl hover:bg-red-50 flex items-center justify-center gap-2"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {pastBookings.length === 0 ? (
            <div className="text-center py-12 text-black/50">
              Your past appointments and result photos will appear here.
            </div>
          ) : (
            pastBookings.map((booking) => (
              <div key={booking.id} className="border border-black/10 rounded-3xl p-6 opacity-75">
                <div className="flex justify-between">
                  <div>
                    <p className="text-xs text-black/60">{booking.date} • {booking.time}</p>
                    <h3 className="text-lg font-medium mt-1 capitalize">{booking.serviceType}</h3>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-4 py-1 rounded-3xl">
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
