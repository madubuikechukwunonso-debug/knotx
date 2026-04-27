// src/src-pages/AdminSubPage.tsx
'use client';
import { useMemo } from 'react';
import type { AdminTabId } from '@/components/admin/AdminSidebar';
import AdminModulePlaceholder from '@/sections/admin/AdminModulePlaceholder';
// AdminOverviewSection is missing → we'll use placeholder for now (you can add real dashboard later)

export default function AdminSubPage({ tab }: { tab: AdminTabId }) {
  const content = useMemo(() => {
    // TODO: When you implement real sections, add them here
    // case 'overview': return <AdminOverviewSection />;
    return (
      <AdminModulePlaceholder
        eyebrow={tab.toUpperCase()}
        title={`Manage ${tab}`}
        description="This section has been migrated into the Next.js admin workspace and is ready for backend wiring."
        bullets={[
          `Responsive ${tab} management UI preserved.`,
          `API endpoint scaffold created under src/app/api/admin/${tab}.`,
          `Service layer prepared under src/modules/admin.`,
        ]}
      />
    );
  }, [tab]);

  return <>{content}</>;   // ← NO MORE AdminShell wrapper
}
