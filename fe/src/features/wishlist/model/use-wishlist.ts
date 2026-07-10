import { useEffect, useState } from "react";
import { getWishlist, addToWishlist, removeFromWishlist } from "../api/wishlist-api";
import { getSupabaseClient } from "@/shared/lib/supabase/client";
import type { Product } from "@/entities/product";

export function useWishlist() {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const items = await getWishlist();
      setWishlistItems(items);
    } catch {
      // Session expired — auth state change will handle refresh
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let supabase: any;
    try {
      supabase = getSupabaseClient();
    } catch {
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }: any) => {
      if (!isMounted) return;
      const hasSession = !!data.session;
      setIsAuthenticated(hasSession);
      if (hasSession) {
        void fetchWishlist();
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (!isMounted) return;
      const hasSession = !!session;
      setIsAuthenticated(hasSession);
      if (hasSession) {
        void fetchWishlist();
      } else {
        setWishlistItems([]);
        setIsLoading(false);
      }
    });

    function handleWishlistSync(event: Event) {
      const customEvent = event as CustomEvent<{ items: Product[] }>;
      setWishlistItems(customEvent.detail.items);
    }

    window.addEventListener("novatech:wishlist-updated", handleWishlistSync);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener("novatech:wishlist-updated", handleWishlistSync);
    };
  }, []);

  async function toggleWishlist(product: Product) {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent("novatech:open-auth"));
      return;
    }

    const isWishlisted = wishlistItems.some((item) => item.id === product.id);
    let nextItems = [...wishlistItems];

    try {
      if (isWishlisted) {
        nextItems = wishlistItems.filter((item) => item.id !== product.id);
        setWishlistItems(nextItems);
        window.dispatchEvent(
          new CustomEvent("novatech:wishlist-updated", { detail: { items: nextItems } })
        );
        await removeFromWishlist(product.id);
      } else {
        nextItems = [...wishlistItems, product];
        setWishlistItems(nextItems);
        window.dispatchEvent(
          new CustomEvent("novatech:wishlist-updated", { detail: { items: nextItems } })
        );
        await addToWishlist(product.id);
      }
    } catch (err) {
      console.error("Failed to toggle wishlist:", err);
      setWishlistItems(wishlistItems);
      window.dispatchEvent(
        new CustomEvent("novatech:wishlist-updated", { detail: { items: wishlistItems } })
      );
    }
  }

  return {
    wishlistItems,
    isAuthenticated,
    isLoading,
    toggleWishlist,
    isWishlisted: (productId: string) => wishlistItems.some((item) => item.id === productId),
  };
}
