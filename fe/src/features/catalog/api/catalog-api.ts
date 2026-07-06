import type { Product } from "@/entities/product";

export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
};

export type CatalogBrand = {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
};

export type CatalogProductSort =
  | "newest"
  | "name_asc"
  | "price_asc"
  | "price_desc"
  | "stock_desc";

export type CatalogProductFilters = {
  q?: string;
  brand?: string;
  category?: string;
  sort?: CatalogProductSort;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  featured?: boolean;
};

export type HeroBanner = {
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

export type NewsArticle = {
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

export type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
};

export type VoucherValidation = {
  isValid: boolean;
  code: string;
  title?: string;
  discountAmount: number;
  message?: string;
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function fetchJson<T>(path: string): Promise<T> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [] as T;
    }

    return response.json() as Promise<T>;
  } catch {
    return [] as T;
  }
}

export function getCatalogCategories() {
  return fetchJson<CatalogCategory[]>("/catalog/categories");
}

export function getCatalogBrands() {
  return fetchJson<CatalogBrand[]>("/catalog/brands");
}

export function getHeroBanners() {
  return fetchJson<HeroBanner[]>("/catalog/hero-banners");
}

export function getNewsArticles() {
  return fetchJson<NewsArticle[]>("/catalog/news");
}

export function getActiveVouchers() {
  return fetchJson<Voucher[]>("/catalog/vouchers");
}

export function validateVoucher(code: string, subtotal: number) {
  const searchParams = new URLSearchParams({
    code,
    subtotal: String(subtotal),
  });

  return fetchJson<VoucherValidation>(
    `/catalog/vouchers/validate?${searchParams.toString()}`,
  );
}

export function getFeaturedProducts() {
  return fetchJson<Product[]>("/catalog/products/featured");
}

export function getCatalogProducts(filters: CatalogProductFilters = {}) {
  const searchParams = new URLSearchParams();

  if (filters.q?.trim()) {
    searchParams.set("q", filters.q.trim());
  }

  if (filters.brand?.trim()) {
    searchParams.set("brand", filters.brand.trim());
  }

  if (filters.category?.trim()) {
    searchParams.set("category", filters.category.trim());
  }

  if (filters.sort && filters.sort !== "newest") {
    searchParams.set("sort", filters.sort);
  }

  if (filters.minPrice?.trim()) {
    searchParams.set("minPrice", filters.minPrice.trim());
  }

  if (filters.maxPrice?.trim()) {
    searchParams.set("maxPrice", filters.maxPrice.trim());
  }

  if (filters.inStock) {
    searchParams.set("inStock", "true");
  }

  if (filters.featured) {
    searchParams.set("featured", "true");
  }

  const queryString = searchParams.toString();

  return fetchJson<Product[]>(
    `/catalog/products${queryString ? `?${queryString}` : ""}`,
  );
}
