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

  if (!session?.userId || !["admin", "super_admin"].includes(session.role || "")) {
    redirect("/dashboard");
  }

  return <AdminUI>{children}</AdminUI>;
}
