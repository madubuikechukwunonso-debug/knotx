// src/components/admin/AdminSidebar.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { X, DollarSign, Calendar } from "lucide-react";
import { useTheme } from "next-themes"; // ← Added for theme logic

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

  return (
    <div className="flex h-full flex-col bg-emerald-950 text-white">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-emerald-800 px-5 py-5 lg:px-6">
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
          className="lg:hidden h-10 w-10 flex items-center justify-center rounded-2xl border border-emerald-700 hover:bg-emerald-900 transition-colors"
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
                  active
                    ? "bg-white text-emerald-950 shadow-xl"
                    : "hover:bg-emerald-900/50 text-emerald-100"
                }`}
              >
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-2xl transition-colors ${
                    active ? "bg-emerald-600 text-white" : "bg-emerald-900/70 text-emerald-300"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-medium text-base">{tab.label}</p>
                  <p className={`text-xs mt-0.5 ${active ? "text-emerald-700" : "text-emerald-400"}`}>
                    {tab.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM FOOTER — Theme switcher added to match layout.tsx logic */}
      <div className="border-t border-emerald-800 p-5 text-xs text-emerald-400">
        <div className="rounded-3xl bg-emerald-900/40 p-4">
          <p className="uppercase text-[10px] tracking-widest mb-1">
            {isStaff ? "💼 My Tasks" : "💰 Money moves"}
          </p>
          <p className="text-emerald-200 text-sm mb-3">
            {isStaff
              ? "Handle bookings, messages, and services efficiently."
              : "All your business tools in one beautiful place."}
          </p>

          {/* Theme Switcher — consumes the ThemeProvider from layout.tsx */}
          <div>
            <p className="uppercase text-[10px] tracking-widest mb-2 text-emerald-300">Theme</p>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => {
                const isActive = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    title={t.label}
                    className={`h-7 w-7 rounded-full border border-emerald-700 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                      isActive ? "ring-2 ring-white ring-offset-2 ring-offset-emerald-950" : ""
                    }`}
                    style={{ backgroundColor: t.color }}
                    aria-label={`Switch to ${t.label} theme`}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-emerald-500 capitalize">{theme || "dark"}</p>
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
      </>
    </>
  );
}
