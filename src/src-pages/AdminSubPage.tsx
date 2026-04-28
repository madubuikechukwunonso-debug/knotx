// src/src-pages/AdminSubPage.tsx
import type { AdminTabId } from '@/components/admin/AdminSidebar';

// Fully functional sections
import AdminOverviewSection from '@/sections/admin/AdminOverviewSection';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminStaffSection from '@/sections/admin/AdminStaffSection';
import AdminMessagesSection from '@/sections/admin/AdminMessagesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';

// Simple placeholders for the remaining tabs
import AdminNewsletterSection from '@/sections/admin/AdminNewsletterSection';
import AdminUsersSection from '@/sections/admin/AdminUsersSection';

type AdminSubPageProps = {
  tab: AdminTabId;
};

export default function AdminSubPage({ tab }: AdminSubPageProps) {
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

    case 'newsletter':
      return <AdminNewsletterSection />;
    case 'users':
      return <AdminUsersSection />;

    default:
      return <AdminOverviewSection />;
  }
}
