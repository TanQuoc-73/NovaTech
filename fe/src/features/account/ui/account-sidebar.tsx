"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/account", label: "Hồ sơ", icon: User },
  { href: "/account/addresses", label: "Địa chỉ", icon: MapPin },
  { href: "/account/wishlist", label: "Yêu thích", icon: Heart },
] as const;

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <aside className="rounded-lg border border-amber-900/10 bg-white p-2 shadow-sm">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/account"
              ? pathname === "/account"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-amber-100 text-amber-900"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
