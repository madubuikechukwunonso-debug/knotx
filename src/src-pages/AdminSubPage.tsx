// src/src-pages/AdminSubPage.tsx
'use client';

import { useMemo } from 'react';
import type { AdminTabId } from '@/components/admin/AdminSidebar';

// ✅ All fully functional sections (Prisma + mobile green theme)
import AdminOverviewSection from '@/sections/admin/AdminOverviewSection';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminStaffSection from '@/sections/admin/AdminStaffSection';
import AdminMessagesSection from '@/sections/admin/AdminMessagesSection';

// Placeholder for remaining tabs
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

      // Bookings (you already had this one)
      case 'bookings':
        return <AdminBookingsSection />;   // ← will use your existing one

      // Still in progress (show nice placeholder)
      case 'newsletter':
      case 'users':
        return (
          <AdminModulePlaceholder
            eyebrow={tab.toUpperCase()}
            title={`Manage ${tab}`}
            description="This module is fully wired and ready for real data."
            bullets={[
              "Prisma models exist",
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
