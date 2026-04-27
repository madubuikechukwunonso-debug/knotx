// src/components/admin/AdminHeader.tsx
"use client";
import { Menu, DollarSign } from "lucide-react";

type Props = {
  title: string;
  description: string;
  onMenuClick: () => void;
};

export default function AdminHeader({ title, description, onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <DollarSign className="h-8 w-8 text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <h1 className="font-serif text-3xl text-emerald-950 truncate">{title}</h1>
            <p className="text-emerald-600 text-sm mt-px">{description}</p>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden h-12 w-12 flex items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
