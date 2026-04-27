// src/src-pages/AdminSubPage.tsx
import type { AdminTabId } from '@/components/admin/AdminSidebar';
import AdminModulePlaceholder from '@/sections/admin/AdminModulePlaceholder';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminUsersSection from '@/sections/admin/AdminUsersSection';

type AdminSubPageProps = {
  tab: AdminTabId | string;
};

export default function AdminSubPage({ tab }: AdminSubPageProps) {
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

    default: {
      const fallbackTab = String(tab || 'admin');

      return (
        <AdminModulePlaceholder
          eyebrow={fallbackTab.toUpperCase()}
          title={`Manage ${fallbackTab}`}
          description="This section is under active development."
          bullets={[
            'Prisma models can be connected here',
            'Full CRUD can be added when this tab is ready',
            'Real-time data will appear here once wired',
          ]}
        />
      );
    }
  }
}
