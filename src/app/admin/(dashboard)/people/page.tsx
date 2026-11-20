import { redirect } from "next/navigation";
import { currentAdmin } from "../../../../lib/adminSession";
import PeopleManager from "../../../../components/admin/PeopleManager";

export const dynamic = "force-dynamic";

export default async function AdminPeoplePage() {
  const admin = await currentAdmin();
  if (!admin) redirect("/admin/login");
  if (admin.role !== "owner") redirect("/admin");
  return <PeopleManager />;
}
