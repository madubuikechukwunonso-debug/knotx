// src/components/admin/AdminSidebar.tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { X, DollarSign } from "lucide-react";

export type AdminTabId =
  | "overview" | "services" | "products" | "gallery" | "orders"
  | "newsletter" | "users" | "staff" | "messages" | "bookings";

export type AdminTab = {
  id: AdminTabId;
  label: string;
  description: string;
  icon: LucideIcon;
};

type Props = {
  tabs: AdminTab[];
  activeTab: AdminTabId;
  onChange: (tab: AdminTabId) => void;
  mobileOpen: boolean;
  onClose: () => void;
};

function SidebarContent({ tabs, activeTab, onChange, onClose }: Omit<Props, "mobileOpen">) {
  return (
    <div className="flex h-full flex-col bg-emerald-950 text-white">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-emerald-800 px-5 py-5 lg:px-6">
        <div className="flex items-center gap-2">
          <DollarSign className="h-7 w-7 text-emerald-400" />
          <div>
            <p className="text-[10px] uppercase tracking-[1px] text-emerald-300">KNOTX & KRAFTS</p>
            <h2 className="font-serif text-2xl">Admin</h2>
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
                <div className={`h-10 w-10 flex items-center justify-center rounded-2xl transition-colors ${
                  active ? "bg-emerald-600 text-white" : "bg-emerald-900/70 text-emerald-300"
                }`}>
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

      {/* BOTTOM FOOTER */}
      <div className="border-t border-emerald-800 p-5 text-xs text-emerald-400">
        <div className="rounded-3xl bg-emerald-900/40 p-4">
          <p className="uppercase text-[10px] tracking-widest mb-1">💰 Money moves</p>
          <p className="text-emerald-200 text-sm">All your business tools in one beautiful place.</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminSidebar(props: Props) {
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
