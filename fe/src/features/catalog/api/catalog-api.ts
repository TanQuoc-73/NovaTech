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
