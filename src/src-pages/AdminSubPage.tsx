'use client';
import { useMemo } from 'react';
import AdminShell from '@/components/admin/AdminShell';
import type { AdminTabId } from '@/components/admin/AdminSidebar';
import AdminOverviewSection from '@/sections/admin/AdminOverviewSection';
import AdminModulePlaceholder from '@/sections/admin/AdminModulePlaceholder';

export default function AdminSubPage({ tab }: { tab: AdminTabId }) {
  const content = useMemo(() => {
    switch (tab) {
      case 'overview': return <AdminOverviewSection />;
      default: return <AdminModulePlaceholder eyebrow={tab.toUpperCase()} title={`Manage ${tab}`} description="This section has been migrated into the Next.js admin workspace and is ready for backend wiring." bullets={[`Responsive ${tab} management UI preserved.`,`API endpoint scaffold created under src/app/api/admin/${tab}.`,`Service layer prepared under src/modules/admin.`]} />;
    }
  }, [tab]);
  return <AdminShell activeTab={tab} onChangeTab={() => {}}>{content}</AdminShell>;
}
