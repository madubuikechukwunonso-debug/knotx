// src/src-pages/AdminSubPage.tsx
import type { AdminTabId } from '@/components/admin/AdminSidebar';
import { prisma } from '@/lib/prisma';
import AdminOverviewSection from '@/sections/admin/AdminOverviewSection';
import AdminServicesSection from '@/sections/admin/AdminServicesSection';
import AdminProductsSection from '@/sections/admin/AdminProductsSection';
import AdminGallerySection from '@/sections/admin/AdminGallerySection';
import AdminOrdersSection from '@/sections/admin/AdminOrdersSection';
import AdminNewsletterSection from '@/sections/admin/AdminNewsletterSection';
import AdminUsersSection from '@/sections/admin/AdminUsersSection';
import AdminStaffSection from '@/sections/admin/AdminStaffSection';
import AdminMessagesSection from '@/sections/admin/AdminMessagesSection';
import AdminBookingsSection from '@/sections/admin/AdminBookingsSection';
import AdminAvailabilitySection from '@/sections/admin/AdminAvailabilitySection';

type AdminSubPageProps = {
  tab: AdminTabId;
};

export default async function AdminSubPage({ tab }: AdminSubPageProps) {
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
      const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return <AdminOrdersSection orders={orders} />;

    case 'newsletter':
      // ============================================
      // FETCH DATA FOR NEWSLETTER SECTION
      // ============================================
      const [subscribers, localUsers] = await Promise.all([
        prisma.subscriber.findMany({
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            name: true,
            source: true,
            isActive: true,
            unsubscribedAt: true,
            createdAt: true,
            localUser: { select: { displayName: true } },
          },
        }),
        prisma.localUser.findMany({
          select: {
            id: true,
            email: true,
            displayName: true,
            createdAt: true,
          },
        }),
      ]);

      // Build combined contacts list (subscribers + registered users)
      const contacts = [
        ...subscribers.map((s) => ({
          id: `sub-${s.id}`,
          email: s.email,
          name: s.name || s.localUser?.displayName || '—',
          source: s.source,
          isActive: s.isActive,
          joined: s.createdAt,
          type: 'subscriber' as const,
        })),
        ...localUsers
          .filter((u) => !subscribers.some((s) => s.email === u.email))
          .map((u) => ({
            id: `user-${u.id}`,
            email: u.email,
            name: u.displayName || '—',
            source: 'REGISTRATION' as const,
            isActive: true,
            joined: u.createdAt,
            type: 'user' as const,
          })),
      ].sort((a, b) => new Date(b.joined).getTime() - new Date(a.joined).getTime());

      // Calculate stats
      const total = contacts.length;
      const active = contacts.filter((c) => c.isActive).length;
      const fromHomepage = contacts.filter((c) => c.source === 'HOMEPAGE').length;

      return (
        <AdminNewsletterSection
          subscribers={subscribers}
          localUsers={localUsers}
          contacts={contacts}
          stats={{
            total,
            active,
            fromHomepage,
          }}
        />
      );

    case 'users':
      const users = await prisma.localUser.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          displayName: true,
          username: true,
          email: true,
          role: true,
          isActive: true,
          isBlocked: true,
          blockedReason: true,
          createdAt: true,
          lastSignInAt: true,
        },
      });
      return <AdminUsersSection users={users} />;

    case 'staff':
      return <AdminStaffSection />;

    case 'messages':
      return <AdminMessagesSection />;

    case 'bookings':
      return <AdminBookingsSection />;

    case 'availability':
      return <AdminAvailabilitySection />;

    default:
      return <AdminOverviewSection />;
  }
}
