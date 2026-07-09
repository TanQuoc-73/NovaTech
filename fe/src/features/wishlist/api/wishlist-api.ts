import { apiFetch } from "@/shared/lib/api/client";
import type { Product } from "@/entities/product";

export function getWishlist() {
  return apiFetch<Product[]>("/wishlist", {
    authenticated: true,
  });
}

export function addToWishlist(productId: string) {
  return apiFetch<void>("/wishlist", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({ productId }),
  });
}

export function removeFromWishlist(productId: string) {
  return apiFetch<void>(`/wishlist/${productId}`, {
    method: "DELETE",
    authenticated: true,
  });
}
