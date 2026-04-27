// src/src-pages/AdminSubPage.tsx
import type { AdminTabId } from '@/components/admin/AdminSidebar';
import AdminModulePlaceholder from '@/sections/admin/AdminModulePlaceholder';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminUsersSection from '@/sections/admin/AdminUsersSection';

export default function AdminSubPage({ tab }: { tab: AdminTabId }) {
  switch (tab) {
    case 'services':
      return <AdminServicesSection />;
    case 'bookings':
      return <AdminBookingsSection />;
    case 'products':
      return <AdminProductsSection />;
    case 'orders':
      return <AdminOrdersSection />;
    case 'gallery':
      return <AdminGallerySection />;
    case 'users':
      return <AdminUsersSection />;
    default:
      return (
        <AdminModulePlaceholder
          eyebrow={tab.toUpperCase()}
          title={`Manage ${tab}`}
          description="Backend wiring in progress. This tab is fully ready for real data + CRUD."
          bullets={[
            'Prisma models already exist',
            'Full CRUD + forms coming in next steps',
            'Real-time data will appear here',
          ]}
        />
      );
  }
}
