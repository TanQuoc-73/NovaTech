"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Boxes, Contact, CreditCard, Home, MessageCircle, Megaphone, ReceiptText, Users } from "lucide-react";

import { LogoutButton } from "@/features/auth";
import { getDictionary, resolveLocale } from "@/shared/i18n";

const adminNavKeys = [
  { href: "/admin/dashboard", key: "overview" as const, icon: BarChart3 },
  { href: "/admin/catalog", key: "catalog" as const, icon: Boxes },
  { href: "/admin/orders", key: "orders" as const, icon: ReceiptText },
  { href: "/admin/payments", key: "payments" as const, icon: CreditCard },
  { href: "/admin/marketing", key: "marketing" as const, icon: Megaphone },
  { href: "/admin/customers", key: "customers" as const, icon: Contact },
  { href: "/admin/users", key: "users" as const, icon: Users },
  { href: "/admin/chat", key: "chat" as const, icon: MessageCircle },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = resolveLocale(searchParams?.get("lang") ?? undefined);
  const t = getDictionary(locale).ui.admin;
  const navItems = adminNavKeys.map((item) => ({
    ...item,
    label: t.nav[item.key],
  }));

  return (
    <main className="min-h-screen bg-[#eaf6fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-cyan-950/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="flex shrink-0 items-center gap-3 py-3 pr-3"
          >
            <img
              src="/NovaTech_daymode.png"
              alt="NovaTech"
              className="logo-light h-8 w-auto object-contain"
            />
            <img
              src="/NovaTech_nightmode.png"
              alt="NovaTech"
              className="logo-dark h-8 w-auto object-contain"
            />
            <span className="hidden text-sm font-semibold text-slate-600 sm:block">
              Admin
            </span>
          </Link>

          <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto py-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-cyan-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex shrink-0 items-center gap-2 py-3">
            <Link
              href="/"
              className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-950/10 bg-white text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600"
              aria-label="Về trang chủ"
              title="Về trang chủ"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
            <LogoutButton className="h-9 w-9 rounded-lg border-cyan-950/10 bg-white text-slate-600 hover:border-cyan-400 hover:bg-cyan-50" dictionary={getDictionary(locale)} />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  );
}
