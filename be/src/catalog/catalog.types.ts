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

export type CatalogHeroBannerDto = {
  id: string;
  title: string;
  subtitle: string | null;
  label: string | null;
  tag: string | null;
  deviceType: string | null;
  priceText: string | null;
  highlightLabel: string | null;
  highlight: string | null;
  imageUrl: string | null;
  href: string | null;
  gradient: string;
  sortOrder: number;
};

export type CatalogNewsArticleDto = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  imageUrl: string | null;
  href: string | null;
  publishedAt: string;
};

export type CatalogVoucherDto = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
};

export type VoucherValidationDto = {
  isValid: boolean;
  code: string;
  title?: string;
  discountAmount: number;
  message?: string;
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
  reviews: CatalogProductReviewDto[];
};

export type CatalogProductReviewDto = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  authorName: string;
  createdAt: string;
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
