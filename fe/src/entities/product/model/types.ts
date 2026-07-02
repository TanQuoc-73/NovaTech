export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  stock: number;
  imageUrl: string;
  badges: string[];
  variants: ProductVariant[];
};

export type ProductVariant = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  storage: string | null;
  ram: string | null;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: ProductVariantImage[];
};

export type ProductVariantImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};
