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

const tabs: AdminTab[] = [ /* same tabs array as before – unchanged */ ];

const getHeaderContent = (tab: AdminTabId) => { /* same as before – unchanged */ };

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
    setMobileOpen(false); // auto-close drawer after navigation
  };

  const handleMenuClick = () => setMobileOpen(true);
  const handleClose = () => setMobileOpen(false);

  const { title, description } = getHeaderContent(activeTab);

  return (
    <div className="flex h-dvh bg-gray-50 overflow-hidden"> {/* ← fixed viewport */}
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
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
