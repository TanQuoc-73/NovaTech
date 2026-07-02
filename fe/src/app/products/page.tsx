import {
  getCatalogBrands,
  getCatalogCategories,
  getCatalogProducts,
  type CatalogProductSort,
} from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { ProductFilters } from "@/widgets/product-filters";
import { ProductGrid } from "@/widgets/product-grid";
import { SiteHeader } from "@/widgets/site-header";

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
  const [categories, brands, products] = await Promise.all([
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
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <SiteHeader dictionary={dictionary} locale={locale} searchQuery={searchQuery} />

      <section id="featured-products" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mb-6 grid gap-4 lg:flex lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {dictionary.nav.products}
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-stone-950">
              Danh sach san pham
            </h1>
          </div>
          <ProductFilters
            brands={brands}
            categories={categories}
            locale={locale}
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
          <ProductGrid products={products} dictionary={dictionary} />
        ) : (
          <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-6 text-sm text-stone-600">
            Khong co san pham nao khop voi dieu kien hien tai.
          </div>
        )}
      </section>
    </main>
  );
}
