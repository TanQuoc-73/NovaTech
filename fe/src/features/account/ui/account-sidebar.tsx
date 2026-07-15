"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, MapPin, User } from "lucide-react";
import type { Dictionary } from "@/shared/i18n";

const NAV_ITEMS = [
  { href: "/account", icon: User, key: "profile" as const },
  { href: "/account/addresses", icon: MapPin, key: "addresses" as const },
  { href: "/account/wishlist", icon: Heart, key: "wishlist" as const },
] as const;

export function AccountSidebar({ dictionary }: { dictionary: Dictionary }) {
  const pathname = usePathname();
  const t = dictionary.ui.account.sidebar;

  return (
    <aside className="rounded-lg border border-amber-900/10 bg-white p-2 shadow-sm">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
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
              {t[key]}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
