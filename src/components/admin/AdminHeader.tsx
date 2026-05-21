// src/components/admin/AdminHeader.tsx
"use client";

import { Menu, DollarSign } from "lucide-react";
import { useTheme } from "next-themes";

type Props = {
  title: string;
  description: string;
  onMenuClick: () => void;
};

export default function AdminHeader({ title, description, onMenuClick }: Props) {
  const { theme } = useTheme();

  // Theme-aware styling aligned with globals.css [data-theme] system
  const getHeaderStyles = () => {
    switch (theme) {
      case "dark":
      case "midnight":
      case "ocean":
        return {
          header: "border-slate-800 bg-slate-950/95 backdrop-blur-lg shadow-sm",
          icon: "text-emerald-400",
          title: "text-white",
          description: "text-slate-400",
          button: "bg-slate-800 text-slate-300 hover:bg-slate-700",
        };
      case "rose":
        return {
          header: "border-rose-200 bg-white/95 backdrop-blur-lg shadow-sm",
          icon: "text-rose-600",
          title: "text-rose-950",
          description: "text-rose-600",
          button: "bg-rose-100 text-rose-700 hover:bg-rose-200",
        };
      case "light":
      default:
        return {
          header: "border-emerald-200 bg-white/95 backdrop-blur-lg shadow-sm",
          icon: "text-emerald-600",
          title: "text-emerald-950",
          description: "text-emerald-600",
          button: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
        };
    }
  };

  const styles = getHeaderStyles();

  return (
    <header className={`sticky top-0 z-40 border-b ${styles.header}`}>
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <DollarSign className={`h-8 w-8 ${styles.icon} flex-shrink-0`} />
          <div className="min-w-0">
            <h1 className={`font-serif text-3xl ${styles.title} truncate`}>{title}</h1>
            <p className={`${styles.description} text-sm mt-px`}>{description}</p>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className={`lg:hidden h-12 w-12 flex items-center justify-center rounded-3xl ${styles.button} transition-colors`}
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
}
