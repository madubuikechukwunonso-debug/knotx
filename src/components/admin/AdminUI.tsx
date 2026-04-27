// src/components/admin/AdminUI.tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Briefcase,
  Package,
  Image,
  ShoppingCart,
  Mail,
  Users,
  UserCog,
  MessageCircle,
  Calendar,
} from "lucide-react";

import AdminSidebar, { type AdminTabId, type AdminTab } from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

// ====================== FULL TABS (for admin / super_admin) ======================
const fullTabs: AdminTab[] = [
  { id: "overview", label: "Overview", description: "Business dashboard & metrics", icon: LayoutDashboard },
  { id: "services", label: "Services", description: "Manage offerings & pricing", icon: Briefcase },
  { id: "products", label: "Products", description: "Inventory & catalog", icon: Package },
  { id: "gallery", label: "Gallery", description: "Photos & media", icon: Image },
  { id: "orders", label: "Orders", description: "Customer orders", icon: ShoppingCart },
  { id: "newsletter", label: "Newsletter", description: "Campaigns & subscribers", icon: Mail },
  { id: "users", label: "Users", description: "Customer accounts", icon: Users },
  { id: "staff", label: "Staff", description: "Team & permissions", icon: UserCog },
  { id: "messages", label: "Messages", description: "Inquiries & replies", icon: MessageCircle },
  { id: "bookings", label: "Bookings", description: "Appointments", icon: Calendar },
];

// ====================== STAFF-ONLY TABS ======================
const staffTabs: AdminTab[] = [
  { id: "overview", label: "Overview", description: "Your dashboard & metrics", icon: LayoutDashboard },
  { id: "services", label: "Services", description: "View available services", icon: Briefcase },
  { id: "bookings", label: "Bookings", description: "Manage your appointments", icon: Calendar },
  { id: "messages", label: "Messages", description: "Customer inquiries", icon: MessageCircle },
  { id: "orders", label: "Orders", description: "Customer orders", icon: ShoppingCart },
];

export default function AdminUI({
  children,
  role,
}: {
  children: React.ReactNode;
  role: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isStaff = role === "staff";
  const tabs: AdminTab[] = isStaff ? staffTabs : fullTabs;

  const getActiveTab = (): AdminTabId => {
    if (pathname === "/admin" || pathname === "/admin/") return "overview";
    const segment = pathname.split("/")[2] || "overview";
    return segment as AdminTabId;
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: AdminTabId) => {
    const route = tab === "overview" ? "/admin" : `/admin/${tab}`;
    router.push(route);
    setMobileOpen(false);
  };

  const handleMenuClick = () => setMobileOpen(true);
  const handleClose = () => setMobileOpen(false);

  const { title, description } = getHeaderContent(activeTab);

  return (
    <div className="flex h-dvh bg-emerald-50 overflow-hidden">
      <AdminSidebar
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        mobileOpen={mobileOpen}
        onClose={handleClose}
        role={role}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader
          title={title}
          description={description}
          onMenuClick={handleMenuClick}
        />

        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-emerald-50">
          {children}
        </main>
      </div>
    </div>
  );
}

// Header content map
const getHeaderContent = (tab: AdminTabId): { title: string; description: string } => {
  const map: Record<AdminTabId, { title: string; description: string }> = {
    overview: { title: "Overview", description: "Real-time business metrics • $ Knotx & Krafts" },
    services: { title: "Services", description: "Manage your service catalog" },
    products: { title: "Products", description: "Inventory & pricing" },
    gallery: { title: "Gallery", description: "Curate your visual story" },
    orders: { title: "Orders", description: "Fulfill customer orders" },
    newsletter: { title: "Newsletter", description: "Send campaigns & grow list" },
    users: { title: "Users", description: "Customer management" },
    staff: { title: "Staff", description: "Team & permissions" },
    messages: { title: "Messages", description: "Customer support inbox" },
    bookings: { title: "Bookings", description: "Manage appointments" },
  };
  return map[tab] || { title: "Dashboard", description: "Knotx & Krafts" };
};
