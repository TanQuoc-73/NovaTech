import {
  getCatalogBrands,
  getCatalogCategories,
  getCatalogProducts,
  type CatalogProductSort,
} from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { ProductFilters } from "@/widgets/product-filters";
import { ProductGrid } from "@/widgets/product-grid";
import { ProductPagination } from "@/widgets/product-pagination";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";

type ProductsPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
    q?: string | string[];
    brand?: string | string[];
    category?: string | string[];
    sort?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
    inStock?: string | string[];
    featured?: string | string[];
    page?: string | string[];
  }>;
};

const productSorts: CatalogProductSort[] = [
  "newest",
  "name_asc",
  "price_asc",
  "price_desc",
  "stock_desc",
];

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveProductSort(value: string | string[] | undefined) {
  const sort = getSingleParam(value);

  return productSorts.includes(sort as CatalogProductSort)
    ? (sort as CatalogProductSort)
    : "newest";
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);
  const searchQuery = getSingleParam(params?.q)?.trim() ?? "";
  const selectedBrand = getSingleParam(params?.brand)?.trim() ?? "";
  const selectedCategory = getSingleParam(params?.category)?.trim() ?? "";
  const selectedSort = resolveProductSort(params?.sort);
  const minPrice = getSingleParam(params?.minPrice)?.trim() ?? "";
  const maxPrice = getSingleParam(params?.maxPrice)?.trim() ?? "";
  const inStock = getSingleParam(params?.inStock) === "true";
  const featured = getSingleParam(params?.featured) === "true";
  const currentPage = Math.max(1, Number(getSingleParam(params?.page)) || 1);
  const [categories, brands, result] = await Promise.all([
    getCatalogCategories(),
    getCatalogBrands(),
    getCatalogProducts({
      q: searchQuery,
      brand: selectedBrand,
      category: selectedCategory,
      sort: selectedSort,
      minPrice,
      maxPrice,
      inStock,
      featured,
      page: currentPage,
      limit: 12,
    }),
  ]);

  const products = result.data;
  const totalPages = result.totalPages;
  const totalProducts = result.total;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} searchQuery={searchQuery} />

      <section id="featured-products" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6">
          <ProductFilters
            brands={brands}
            categories={categories}
            locale={locale}
            dictionary={dictionary}
            searchQuery={searchQuery}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            featured={featured}
            actionPath="/products"
          />
        </div>

        {products.length > 0 ? (
          <>
            <ProductGrid
              products={products}
              dictionary={dictionary}
              enableCompare
            />
            <ProductPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalProducts={totalProducts}
              basePath="/products"
              searchParams={params}
            />
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            {dictionary.ui.listing.emptyFilter}
          </div>
        )}
      </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}
