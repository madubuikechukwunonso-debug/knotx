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

const tabs: AdminTab[] = [
  {
    id: "overview",
    label: "Overview",
    description: "Dashboard overview and key metrics",
    icon: LayoutDashboard,
  },
  {
    id: "services",
    label: "Services",
    description: "Manage service offerings and pricing",
    icon: Briefcase,
  },
  {
    id: "products",
    label: "Products",
    description: "Manage products and inventory",
    icon: Package,
  },
  {
    id: "gallery",
    label: "Gallery",
    description: "Curate and manage your image gallery",
    icon: Image,
  },
  {
    id: "orders",
    label: "Orders",
    description: "View and fulfill customer orders",
    icon: ShoppingCart,
  },
  {
    id: "newsletter",
    label: "Newsletter",
    description: "Create and send newsletters",
    icon: Mail,
  },
  {
    id: "users",
    label: "Users",
    description: "Manage customer accounts",
    icon: Users,
  },
  {
    id: "staff",
    label: "Staff",
    description: "Manage team members and permissions",
    icon: UserCog,
  },
  {
    id: "messages",
    label: "Messages",
    description: "View and respond to inquiries",
    icon: MessageCircle,
  },
  {
    id: "bookings",
    label: "Bookings",
    description: "Manage appointments and reservations",
    icon: Calendar,
  },
];

const getHeaderContent = (tab: AdminTabId) => {
  const map: Record<AdminTabId, { title: string; description: string }> = {
    overview: { title: "Overview", description: "Dashboard overview and key metrics for your business" },
    services: { title: "Services", description: "Manage your service offerings and pricing" },
    products: { title: "Products", description: "Manage products and inventory" },
    gallery: { title: "Gallery", description: "Curate and manage your image gallery" },
    orders: { title: "Orders", description: "View and fulfill customer orders" },
    newsletter: { title: "Newsletter", description: "Create and send newsletters" },
    users: { title: "Users", description: "Manage customer accounts" },
    staff: { title: "Staff", description: "Manage team members and permissions" },
    messages: { title: "Messages", description: "View and respond to inquiries" },
    bookings: { title: "Bookings", description: "Manage appointments and reservations" },
  };
  return map[tab] || { title: "Admin", description: "" };
};

export default function AdminUI({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const getActiveTab = (): AdminTabId => {
    if (pathname === "/admin" || pathname === "/admin/") return "overview";
    const segment = pathname.split("/")[2];
    return (segment === "bookings" ? "bookings" : segment) as AdminTabId || "overview";
  };

  const activeTab = getActiveTab();

  const handleTabChange = (tab: AdminTabId) => {
    const route = tab === "overview" ? "/admin" : `/admin/${tab}`;
    router.push(route);
  };

  const handleMenuClick = () => setMobileOpen(true);
  const handleClose = () => setMobileOpen(false);

  const { title, description } = getHeaderContent(activeTab);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        mobileOpen={mobileOpen}
        onClose={handleClose}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader
          title={title}
          description={description}
          onMenuClick={handleMenuClick}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
