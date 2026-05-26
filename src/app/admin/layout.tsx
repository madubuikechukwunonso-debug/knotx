// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminUI from "@/components/admin/AdminUI";
import { ThemeProvider } from 'next-themes';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Allow admin, super_admin, and staff roles
  if (!session?.userId || !["admin", "super_admin", "staff"].includes(session.role || "")) {
    redirect("/dashboard");
  }

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
      themes={['dark', 'midnight', 'ocean', 'rose', 'light']}
      storageKey="admin-theme"
    >
      <AdminUI role={session.role}>
        {children}
      </AdminUI>
    </ThemeProvider>
  );
}
