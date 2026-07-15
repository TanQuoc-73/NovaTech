"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  ClipboardList,
  Headphones,
  Home,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  ShieldCheck,
} from "lucide-react";

import { signOut } from "@/features/auth/model/auth-client";
import { getDictionary, resolveLocale } from "@/shared/i18n";

const staffNavKeys = [
  { href: "/staff/dashboard", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/staff/orders", key: "orders" as const, icon: ClipboardList },
  { href: "/staff/inventory", key: "inventory" as const, icon: PackageCheck },
  { href: "/staff/support", key: "support" as const, icon: Headphones },
];

export function StaffShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams?.get("lang") ?? undefined);
  const dictionary = getDictionary(locale);
  const t = dictionary.ui.staff;
  const navItems = staffNavKeys.map((item) => ({
    ...item,
    label: t.nav[item.key],
  }));

  async function handleSignOut() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-amber-900/10 bg-[#2f1d14] text-white shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/staff/dashboard"
            className="flex min-w-fit items-center gap-2 rounded-md px-2 py-1.5 font-semibold"
          >
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400 text-[#2f1d14]">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>{t.title}</span>
          </Link>

          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-amber-400 text-[#2f1d14]"
                      : "text-amber-50/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-amber-50 transition hover:bg-white/10"
              aria-label={dictionary.ui.admin.logoutAria}
              title={dictionary.ui.admin.logoutAria}
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-amber-50 transition hover:bg-white/10"
              aria-label={dictionary.ui.admin.logoutAria}
              title={dictionary.ui.admin.logoutAria}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  );
}
