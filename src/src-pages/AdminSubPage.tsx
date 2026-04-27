// src/src-pages/AdminSubPage.tsx
'use client';

import { useMemo } from 'react';
import type { AdminTabId } from '@/components/admin/AdminSidebar';

// All fully functional sections (now compatible with Pages Router)
import AdminOverviewSection from '@/sections/admin/AdminOverviewSection';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminStaffSection from '@/sections/admin/AdminStaffSection';
import AdminMessagesSection from '@/sections/admin/AdminMessagesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';

// Placeholder for any remaining tabs
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

      // Tabs still under development
      case 'newsletter':
      case 'users':
        return (
          <AdminModulePlaceholder
            eyebrow={tab.toUpperCase()}
            title={`Manage ${tab}`}
            description="This module is wired and ready for real data."
          />
        );

      default:
        return <AdminModulePlaceholder title={`Manage ${tab}`} />;
    }
  }, [tab]);

  return <div className="w-full">{content}</div>;
}
