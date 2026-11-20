"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const tabClass = (active: boolean) =>
  `rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
    active
      ? "bg-surfaceLight text-textPrimary"
      : "text-textBody hover:text-textPrimary"
  }`;

export default function AdminHeader({
  name,
  isOwner,
}: {
  name: string;
  isOwner: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="mb-8">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.8px] text-textPrimary">
            Network Admin
          </h1>
          <p className="mt-1 text-xs text-textBody">Signed in as {name}</p>
        </div>
        <button
          type="button"
          onClick={() => void logout()}
          className="shrink-0 rounded-md border border-borderBright px-3 py-1.5 text-xs font-semibold text-textBody transition-colors hover:text-textPrimary"
        >
          Log out
        </button>
      </div>
      <nav className="flex flex-wrap gap-1 border-b border-border pb-3">
        <Link href="/admin" className={tabClass(pathname === "/admin")}>
          Nodes
        </Link>
        {isOwner && (
          <Link
            href="/admin/people"
            className={tabClass(pathname === "/admin/people")}
          >
            People
          </Link>
        )}
        <Link href="/editor" className={tabClass(false)}>
          News queue
        </Link>
      </nav>
    </header>
  );
}
