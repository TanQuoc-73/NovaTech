"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { BarChart3, Boxes, CreditCard, Home, Megaphone, ReceiptText, Shield } from "lucide-react";

import { LogoutButton } from "@/features/auth";

const adminNavItems = [
  {
    href: "/admin/dashboard",
    label: "Tổng quan",
    description: "Doanh số và vận hành",
    icon: BarChart3,
  },
  {
    href: "/admin/catalog",
    label: "Kho hàng",
    description: "Sản phẩm, danh mục, thương hiệu",
    icon: Boxes,
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    description: "Xử lý đơn và trạng thái",
    icon: ReceiptText,
  },
  {
    href: "/admin/payments",
    label: "Thanh toán",
    description: "QR test và phương thức",
    icon: CreditCard,
  },
  {
    href: "/admin/marketing",
    label: "Marketing",
    description: "Banner, tin tức và voucher",
    icon: Megaphone,
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-[#eaf6fb] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-cyan-950/10 bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/admin/dashboard"
            className="flex min-w-fit items-center gap-3 rounded-md px-2 py-1.5 font-semibold"
          >
            <span className="grid h-10 w-10 place-items-center rounded-full bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-900/20">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="grid leading-tight">
              <span>NovaTech Admin</span>
              <span className="text-xs font-semibold text-slate-500">
                Bảng điều khiển
              </span>
            </span>
          </Link>

          <nav className="flex flex-1 flex-wrap items-center justify-center gap-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.description}
                  className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-900/20"
                      : "text-slate-600 hover:bg-cyan-50 hover:text-slate-950"
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
              className="grid h-10 w-10 place-items-center rounded-full border border-cyan-950/10 bg-white text-slate-700 transition hover:border-cyan-500 hover:text-cyan-700"
              aria-label="Về trang chủ"
              title="Về trang chủ"
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
