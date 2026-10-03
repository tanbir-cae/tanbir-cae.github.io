"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileText, Send, ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/branding/wordmark";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { PUBLIC_NAV, PUBLIC_ACTIONS } from "@/lib/constants";

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-surface/90 backdrop-blur-md transition-all">
      <Container className="flex h-16 items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-6">
          <Wordmark />
          <div className="hidden lg:block h-5 w-[1px] bg-border" />
          <p className="hidden xl:block font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            Design · Simulate · Analyze · Build
          </p>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {PUBLIC_NAV.map((item) => {
            const isActive =
              item.href === "/work?category=cfd"
                ? pathname === "/work"
                : pathname === item.href || ((item.href as string) !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-primary font-semibold"
                    : "text-muted hover:text-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 font-mono text-xs gap-1.5 border-border">
            <Link href="/cv">
              <FileText className="h-3.5 w-3.5 text-muted" />
              CV
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 font-mono text-xs gap-1.5 bg-primary text-white hover:bg-primary/90">
            <Link href="/contact">
              <Send className="h-3 w-3" />
              Contact
            </Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-surface px-4 py-4 md:hidden shadow-lg animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1 pb-3">
            {PUBLIC_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-lg px-3 py-2 font-mono text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-border pt-3 flex flex-col gap-2">
            <Button asChild variant="outline" size="sm" className="w-full justify-center font-mono text-xs gap-2">
              <Link href="/cv" onClick={() => setMobileMenuOpen(false)}>
                <FileText className="h-3.5 w-3.5" />
                Download CV
              </Link>
            </Button>
            <Button asChild size="sm" className="w-full justify-center font-mono text-xs gap-2 bg-primary text-white">
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <Send className="h-3.5 w-3.5" />
                Quick Contact
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
