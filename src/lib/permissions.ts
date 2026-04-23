import { redirect } from 'next/navigation';
import { getSession } from './session';

export function isAdminRole(role?: string | null) {
  return role === 'admin' || role === 'super_admin';
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
