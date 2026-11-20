import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { hasEditorAccess } from "../../../lib/adminSession";

export const dynamic = "force-dynamic";

export default async function EditorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  if (!(await hasEditorAccess())) {
    redirect("/editor/login");
  }
  return <>{children}</>;
}
