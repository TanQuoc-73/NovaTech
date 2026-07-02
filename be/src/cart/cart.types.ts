export type CartItemProductDto = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
};

export type CartItemVariantDto = {
  id: string;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  imageUrl: string | null;
};

export type CartItemDto = {
  id: string;
  quantity: number;
  product: CartItemProductDto;
  variant: CartItemVariantDto;
};

export type CartDto = {
  id: string;
  items: CartItemDto[];
  totalQuantity: number;
  subtotal: number;
};

export type AddCartItemPayload = {
  variantId?: unknown;
  quantity?: unknown;
};

export type UpdateCartItemPayload = {
  quantity?: unknown;
};
