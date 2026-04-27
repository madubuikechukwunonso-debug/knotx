// src/lib/permissions.ts
import { redirect } from 'next/navigation';
import { getSession } from './session';

export function isAdminRole(role?: string | null) {
  return role === 'admin' || role === 'super_admin';
}

export function isStaffRole(role?: string | null) {
  return role === 'staff';
}

export function isAdminOrStaff(role?: string | null) {
  return isAdminRole(role) || isStaffRole(role);
}

// Which tabs a staff member is allowed to see
export const STAFF_ALLOWED_TABS = [
  'overview',
  'services',
  'bookings',
  'messages',
  'staff',        // they can see the staff list
] as const;

export function canAccessTab(role: string | null, tab: string): boolean {
  if (isAdminRole(role)) return true;                    // admin sees everything
  if (isStaffRole(role)) {
    return STAFF_ALLOWED_TABS.includes(tab as any);
  }
  return false;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!isAdminRole(session.role)) redirect('/account');
  return session;
}

// New: allow staff + admin to access the admin area
export async function requireAdminOrStaff() {
  const session = await requireAuth();
  if (!isAdminOrStaff(session.role)) redirect('/account');
  return session;
}
