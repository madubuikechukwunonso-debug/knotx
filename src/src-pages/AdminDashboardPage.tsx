import { requireAdmin } from '@/lib/permissions';
import AdminSubPage from './AdminSubPage';

export default async function AdminDashboardPage() {
  await requireAdmin();
  return <AdminSubPage tab="overview" />;
}
