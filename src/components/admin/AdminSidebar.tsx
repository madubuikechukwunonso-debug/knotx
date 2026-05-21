// src/components/admin/AdminSidebar.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { X, DollarSign } from "lucide-react";
import { useTheme } from "next-themes";

export type AdminTabId =
  | "overview"
  | "services"
  | "products"
  | "gallery"
  | "orders"
  | "newsletter"
  | "users"
  | "staff"
  | "messages"
  | "bookings"
  | "availability";

export type AdminTab = {
  id: AdminTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  tabs: AdminTab[];
  activeTab: AdminTabId;
  onChange: (tab: AdminTabId) => void;
  mobileOpen: boolean;
  onClose: () => void;
  role: string;
};

const THEMES = [
  { id: "dark", label: "Dark (Emerald)", color: "#064e3b" },
  { id: "midnight", label: "Midnight", color: "#1e293b" },
  { id: "ocean", label: "Ocean", color: "#164e63" },
  { id: "rose", label: "Rose", color: "#9f1239" },
  { id: "light", label: "Light", color: "#f1e7d2" },
] as const;

function SidebarContent({
  tabs,
  activeTab,
  onChange,
  onClose,
  role,
}: Omit<AdminSidebarProps, "mobileOpen">) {
  const isStaff = role === "staff";
  const { theme, setTheme } = useTheme();

  // Dynamic sidebar styling based on current theme
  const getSidebarStyles = () => {
    switch (theme) {
      case "dark":
        return {
          container: "bg-emerald-950 text-white",
          headerBorder: "border-emerald-800",
          navActive: "bg-white text-emerald-950 shadow-xl",
          navInactive: "hover:bg-emerald-900/50 text-emerald-100",
          iconActive: "bg-emerald-600 text-white",
          iconInactive: "bg-emerald-900/70 text-emerald-300",
          descriptionActive: "text-emerald-700",
          descriptionInactive: "text-emerald-400",
          footerBorder: "border-emerald-800",
          footerBg: "bg-emerald-900/40",
          footerText: "text-emerald-400",
          footerSubtext: "text-emerald-200",
          themeLabel: "text-emerald-300",
          themeCurrent: "text-emerald-500",
        };
      case "midnight":
        return {
          container: "bg-slate-950 text-white",
          headerBorder: "border-slate-800",
          navActive: "bg-white text-slate-950 shadow-xl",
          navInactive: "hover:bg-slate-900/60 text-slate-200",
          iconActive: "bg-slate-700 text-white",
          iconInactive: "bg-slate-800 text-slate-400",
          descriptionActive: "text-slate-700",
          descriptionInactive: "text-slate-400",
          footerBorder: "border-slate-800",
          footerBg: "bg-slate-900/50",
          footerText: "text-slate-400",
          footerSubtext: "text-slate-200",
          themeLabel: "text-slate-300",
          themeCurrent: "text-slate-500",
        };
      case "ocean":
        return {
          container: "bg-[#0f172a] text-white",
          headerBorder: "border-slate-700",
          navActive: "bg-white text-slate-950 shadow-xl",
          navInactive: "hover:bg-slate-800/60 text-slate-200",
          iconActive: "bg-teal-600 text-white",
          iconInactive: "bg-slate-800 text-slate-400",
          descriptionActive: "text-slate-700",
          descriptionInactive: "text-slate-400",
          footerBorder: "border-slate-700",
          footerBg: "bg-slate-900/50",
          footerText: "text-slate-400",
          footerSubtext: "text-slate-200",
          themeLabel: "text-slate-300",
          themeCurrent: "text-slate-500",
        };
      case "rose":
        return {
          container: "bg-rose-950 text-white",
          headerBorder: "border-rose-800",
          navActive: "bg-white text-rose-950 shadow-xl",
          navInactive: "hover:bg-rose-900/50 text-rose-100",
          iconActive: "bg-rose-600 text-white",
          iconInactive: "bg-rose-900/70 text-rose-300",
          descriptionActive: "text-rose-700",
          descriptionInactive: "text-rose-400",
          footerBorder: "border-rose-800",
          footerBg: "bg-rose-900/40",
          footerText: "text-rose-400",
          footerSubtext: "text-rose-200",
          themeLabel: "text-rose-300",
          themeCurrent: "text-rose-500",
        };
      case "light":
      default:
        return {
          container: "bg-white text-slate-900 border-r border-slate-200",
          headerBorder: "border-slate-200",
          navActive: "bg-emerald-950 text-white shadow-xl",
          navInactive: "hover:bg-slate-100 text-slate-700",
          iconActive: "bg-emerald-600 text-white",
          iconInactive: "bg-slate-200 text-slate-600",
          descriptionActive: "text-emerald-200",
          descriptionInactive: "text-slate-500",
          footerBorder: "border-slate-200",
          footerBg: "bg-slate-100",
          footerText: "text-slate-500",
          footerSubtext: "text-slate-700",
          themeLabel: "text-slate-600",
          themeCurrent: "text-slate-500",
        };
    }
  };

  const s = getSidebarStyles();

  return (
    <div className={`flex h-full flex-col ${s.container}`}>
      {/* HEADER BAR */}
      <div className={`flex items-center justify-between border-b px-5 py-5 lg:px-6 ${s.headerBorder}`}>
        <div className="flex items-center gap-2">
          <DollarSign className="h-7 w-7 text-emerald-400" />
          <div>
            <p className="text-[10px] uppercase tracking-[1px] text-emerald-300">
              KNOTX & KRAFTS
            </p>
            <h2 className="font-serif text-2xl">
              {isStaff ? "Staff Portal" : "Admin"}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-2xl border border-emerald-700 hover:bg-emerald-900/70 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAV */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <nav className="flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.id === activeTab;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  onChange(tab.id);
                  onClose();
                }}
                className={`group flex w-full items-start gap-3 rounded-3xl px-4 py-4 text-left transition-all duration-200 ${
                  active ? s.navActive : s.navInactive
                }`}
              >
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-2xl transition-colors ${
                    active ? s.iconActive : s.iconInactive
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-medium text-base">{tab.label}</p>
                  <p
                    className={`text-xs mt-0.5 ${
                      active ? s.descriptionActive : s.descriptionInactive
                    }`}
                  >
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM FOOTER — Theme switcher */}
      <div className={`border-t p-5 text-xs ${s.footerBorder} ${s.footerText}`}>
        <div className={`rounded-3xl p-4 ${s.footerBg}`}>
          <p className="uppercase text-[10px] tracking-widest mb-1">
            {isStaff ? "💼 My Tasks" : "💰 Money moves"}
          </p>
          <p className={`text-sm mb-3 ${s.footerSubtext}`}>
            {isStaff
              ? "Handle bookings, messages, and services efficiently."
              : "All your business tools in one beautiful place."}
          </p>

          {/* Theme Switcher */}
          <div>
            <p className={`uppercase text-[10px] tracking-widest mb-2 ${s.themeLabel}`}>
              Theme
            </p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    title={t.label}
                    className={`h-7 w-7 rounded-full border transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      isActive
                        ? "ring-2 ring-white ring-offset-2 ring-offset-emerald-950 border-white"
                        : "border-emerald-700"
                    }`}
                    style={{ backgroundColor: t.color }}
                    aria-label={`Switch to ${t.label} theme`}
                  />
                );
              })}
            </div>
            <p className={`mt-1.5 text-[10px] capitalize ${s.themeCurrent}`}>
              {theme || "dark"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar(props: AdminSidebarProps) {
  return (
    <>
      {/* DESKTOP */}
      <aside className="hidden lg:flex lg:w-80 lg:shrink-0 lg:flex-col">
        <SidebarContent {...props} />
      </aside>

      {/* MOBILE DRAWER */}
      {props.mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            onClick={props.onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="absolute left-0 top-0 h-full w-[92%] max-w-[340px] shadow-2xl">
            <SidebarContent {...props} />
          </aside>
        </div>
      )}
    </>
  );
}
