import { apiFetch } from "@/shared/lib/api/client";

export type CartItemProduct = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
};

export type CartItemVariant = {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl: string | null;
};

export type CartItem = {
  id: string;
  quantity: number;
  product: CartItemProduct;
  variant: CartItemVariant;
};

export type Cart = {
  id: string;
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
};

export function getCart() {
  return apiFetch<Cart>("/cart", {
    authenticated: true,
  });
}

export function addCartItem(variantId: string, quantity = 1) {
  return apiFetch<Cart>("/cart/items", {
    method: "POST",
    authenticated: true,
    body: JSON.stringify({
      variantId,
      quantity,
    }),
  });
}

export function updateCartItem(itemId: string, quantity: number) {
  return apiFetch<Cart>(`/cart/items/${itemId}`, {
    method: "PATCH",
    authenticated: true,
    body: JSON.stringify({
      quantity,
    }),
  });
}

export function removeCartItem(itemId: string) {
  return apiFetch<Cart>(`/cart/items/${itemId}`, {
    method: "DELETE",
    authenticated: true,
  });
}

export function clearCart() {
  return apiFetch<Cart>("/cart/items", {
    method: "DELETE",
    authenticated: true,
  });
}
