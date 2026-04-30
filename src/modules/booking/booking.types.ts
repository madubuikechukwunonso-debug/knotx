// ============================================
// COMPLETE FIXED VERSION
// src/modules/booking/booking.types.ts
// ============================================

export type BookingSessionUser = {
  userId: number;
  userType: "local" | "oauth" | "guest";  // ← FIXED: Added "guest"
  email?: string;
  role?: "user" | "worker" | "admin" | "super_admin";
  name?: string;
};

export type AvailableSlot = {
  staffUserId: number;
  staffName: string;
  time: string;
};

export type CreateBookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: number;
  staffUserId: number;
  date: string;
  time: string;
  notes?: string;
  userId?: number;
  userType?: "oauth" | "local" | "guest";  // ← FIXED: Added "guest"
};

export type AvailabilityInput = {
  date: string;
  serviceId: number;
};
