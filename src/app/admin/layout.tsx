// src/app/admin/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminUI from "@/components/admin/AdminUI";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // ✅ Now allows staff + admin roles
  if (!session?.userId || !["admin", "super_admin", "staff"].includes(session.role || "")) {
    redirect("/dashboard");
  }

  return (
    <AdminUI role={session.role}>
      {children}
    </AdminUI>
  );
}
