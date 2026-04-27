// src/src-pages/AdminSubPage.tsx
'use client';
import { useMemo } from 'react';
import type { AdminTabId } from '@/components/admin/AdminSidebar';
import AdminModulePlaceholder from '@/sections/admin/AdminModulePlaceholder';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';

export default function AdminSubPage({ tab }: { tab: AdminTabId }) {
  const content = useMemo(() => {
    switch (tab) {
      case 'services':
        return <AdminServicesSection />;
      case 'bookings':
        return <AdminBookingsSection />;
      default:
        return (
          <AdminModulePlaceholder
            eyebrow={tab.toUpperCase()}
            title={`Manage ${tab}`}
            description="Backend wiring in progress. This tab is fully ready for real data + CRUD."
            bullets={[
              "Prisma models already exist",
              "Full CRUD + forms coming in next steps",
              "Real-time data will appear here",
            ]}
          />
        );
    }
  }, [tab]);

  return <>{content}</>;
}
