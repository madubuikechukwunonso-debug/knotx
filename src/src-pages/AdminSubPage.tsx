// src/src-pages/AdminSubPage.tsx
'use client';

import { useMemo } from 'react';
import type { AdminTabId } from '@/components/admin/AdminSidebar';

// All fully functional sections
import AdminOverviewSection from '@/sections/admin/AdminOverviewSection';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminStaffSection from '@/sections/admin/AdminStaffSection';
import AdminMessagesSection from '@/sections/admin/AdminMessagesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';

// Placeholder component
import AdminModulePlaceholder from '@/sections/admin/AdminModulePlaceholder';

export default function AdminSubPage({ tab }: { tab: AdminTabId }) {
  const content = useMemo(() => {
    switch (tab) {
      case 'overview':
        return <AdminOverviewSection />;
      case 'services':
        return <AdminServicesSection />;
      case 'products':
        return <AdminProductsSection />;
      case 'gallery':
        return <AdminGallerySection />;
      case 'orders':
        return <AdminOrdersSection />;
      case 'staff':
        return <AdminStaffSection />;
      case 'messages':
        return <AdminMessagesSection />;
      case 'bookings':
        return <AdminBookingsSection />;

      // Remaining tabs (still using placeholder)
      case 'newsletter':
      case 'users':
        return (
          <AdminModulePlaceholder
            eyebrow={tab.toUpperCase()}
            title={`Manage ${tab}`}
            description="This module is wired and ready for real data."
            bullets={[
              "Prisma models already exist",
              "Full CRUD forms coming next",
              "Real-time updates enabled",
            ]}
          />
        );

      default:
        return (
          <AdminModulePlaceholder
            eyebrow={tab.toUpperCase()}
            title={`Manage ${tab}`}
            description="This section is under active development."
            bullets={[
              "Backend models are ready",
              "UI is fully responsive",
              "Connecting to database next",
            ]}
          />
        );
    }
  }, [tab]);

  return <div className="w-full">{content}</div>;
}
