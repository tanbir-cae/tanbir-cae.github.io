import type { ReactNode } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/logout-button";
import { Wordmark } from "@/components/branding/wordmark";
import { requireAdmin } from "@/lib/auth/session";
import { ADMIN_NAV } from "@/lib/constants";

export default async function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="flex min-h-full flex-col bg-background lg:flex-row">
      <aside className="border-b border-border bg-surface lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Wordmark href="/admin/dashboard" />
          <p className="mt-3 hidden font-mono text-[11px] uppercase tracking-[0.16em] text-muted lg:block">
            Private CMS
          </p>
        </div>
        <nav aria-label="Admin" className="flex gap-2 overflow-x-auto px-3 pb-3 lg:flex-col lg:px-3">
          {ADMIN_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-muted transition-colors hover:bg-soft hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-surface px-5 py-3">
          <p className="truncate font-mono text-xs text-muted">{user.email}</p>
          <LogoutButton />
        </header>
        <main className="flex-1 p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
