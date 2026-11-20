import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  EDITOR_COOKIE,
  verifySessionCookie,
} from "../../../lib/editorSession";

export const dynamic = "force-dynamic";

export default async function EditorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  if (!verifySessionCookie(cookieStore.get(EDITOR_COOKIE)?.value)) {
    redirect("/editor/login");
  }
  return <>{children}</>;
}
