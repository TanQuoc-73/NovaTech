"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Boxes, CreditCard, Home, ReceiptText, Shield, Users } from "lucide-react";

import { LogoutButton } from "@/features/auth";

const adminNavItems = [
  { href: "/admin/dashboard", label: "Tong quan", icon: BarChart3 },
  { href: "/admin/catalog", label: "Catalog", icon: Boxes },
  { href: "/admin/orders", label: "Don hang", icon: ReceiptText },
  { href: "/admin/payments", label: "Thanh toan", icon: CreditCard },
  { href: "/admin/customers", label: "Khach hang", icon: Users },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <header className="sticky top-0 z-40 border-b border-amber-900/10 bg-[#3a2115] text-white shadow-sm">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="flex min-w-fit items-center gap-2 rounded-md px-2 py-1.5 font-semibold"
          >
            <span className="grid h-9 w-9 place-items-center rounded-md bg-amber-500 text-[#3a2115]">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>NovaTech Admin</span>
          </Link>

          <nav className="flex flex-1 flex-wrap items-center gap-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-amber-500 text-[#3a2115]"
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
              className="grid h-10 w-10 place-items-center rounded-md border border-white/15 text-amber-50 transition hover:bg-white/10"
              aria-label="Ve trang chu"
              title="Ve trang chu"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </main>
  );
}
