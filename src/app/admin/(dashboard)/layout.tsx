import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { currentAdmin } from "../../../lib/adminSession";
import AdminHeader from "../../../components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  return (
    <main className="relative bg-background pt-20 text-textSecondary">
      <section className="relative mx-auto max-w-[860px] px-4 pt-8 pb-20 sm:px-6">
        <AdminHeader name={admin.name} isOwner={admin.role === "owner"} />
        {children}
      </section>
    </main>
  );
}
