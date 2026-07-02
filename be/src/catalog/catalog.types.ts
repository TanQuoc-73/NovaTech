export type CatalogCategoryDto = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type CatalogBrandDto = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type CatalogProductSort =
  'newest' | 'name_asc' | 'price_asc' | 'price_desc' | 'stock_desc';

export type CatalogProductFilters = {
  q?: string;
  brand?: string;
  category?: string;
  sort?: CatalogProductSort;
  minPrice?: string;
  maxPrice?: string;
  inStock?: string;
  featured?: string;
};

export type CatalogProductDto = {
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
  variants: CatalogProductVariantDto[];
};

export type CatalogProductVariantDto = {
  id: string;
  sku: string;
  name: string;
  color: string | null;
  storage: string | null;
  ram: string | null;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: CatalogProductVariantImageDto[];
};

export type CatalogProductVariantImageDto = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
};
