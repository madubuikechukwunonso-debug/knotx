// src/src-pages/AdminDashboardPage.tsx
import AdminSubPage from './AdminSubPage';

export default async function AdminDashboardPage() {
  // requireAdmin() is already handled by layout.tsx
  return <AdminSubPage tab="overview" />;
}
