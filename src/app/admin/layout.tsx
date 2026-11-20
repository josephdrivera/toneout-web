import { ReactNode } from "react";

export const metadata = {
  title: "Network Admin | ToneOut",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
