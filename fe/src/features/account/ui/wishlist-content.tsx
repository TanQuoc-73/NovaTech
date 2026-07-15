"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/features/wishlist/model/use-wishlist";
import { ProductGrid } from "@/widgets/product-grid";
import { AccountSidebar } from "@/features/account/ui/account-sidebar";
import type { Dictionary } from "@/shared/i18n";

export function WishlistContent({ dictionary }: { dictionary: Dictionary }) {
  const { wishlistItems } = useWishlist();
  const t = dictionary.ui.account.wishlist;

  return (
    <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 text-red-600 fill-red-500" aria-hidden="true" />
        <h2 className="text-base font-semibold">{t.title}</h2>
      </div>
      <p className="mt-1 text-sm text-stone-500">
        {t.description}
      </p>

      <div className="mt-6">
        {wishlistItems.length ? (
          <ProductGrid products={wishlistItems} dictionary={dictionary} />
        ) : (
          <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-5 text-sm font-medium text-stone-500">
            {t.empty}
          </div>
        )}
      </div>
    </div>
  );
}
