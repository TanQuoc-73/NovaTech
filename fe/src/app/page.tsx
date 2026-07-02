import {
  getCatalogBrands,
  getCatalogCategories,
  getCatalogProducts,
  getFeaturedProducts,
  type CatalogProductSort,
} from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale } from "@/shared/i18n";
import { HeroCarousel } from "@/widgets/hero-carousel";
import { ProductFilters } from "@/widgets/product-filters";
import { ProductGrid } from "@/widgets/product-grid";
import { SiteHeader } from "@/widgets/site-header";
import Link from "next/link";
import {
  Headphones,
  Keyboard,
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";

type HomePageProps = {
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

const categoryStyles: Record<
  string,
  {
    icon: LucideIcon;
    className: string;
  }
> = {
  laptop: {
    icon: Laptop,
    className:
      "border-sky-200 bg-sky-50 text-sky-950 hover:border-sky-300 hover:bg-sky-100",
  },
  pc: {
    icon: Monitor,
    className:
      "border-slate-200 bg-slate-50 text-slate-950 hover:border-slate-300 hover:bg-slate-100",
  },
  smartphone: {
    icon: Smartphone,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100",
  },
  monitor: {
    icon: Monitor,
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-950 hover:border-indigo-300 hover:bg-indigo-100",
  },
  accessory: {
    icon: Keyboard,
    className:
      "border-amber-200 bg-amber-50 text-amber-950 hover:border-amber-300 hover:bg-amber-100",
  },
  tablet: {
    icon: Tablet,
    className:
      "border-rose-200 bg-rose-50 text-rose-950 hover:border-rose-300 hover:bg-rose-100",
  },
  audio: {
    icon: Headphones,
    className:
      "border-teal-200 bg-teal-50 text-teal-950 hover:border-teal-300 hover:bg-teal-100",
  },
};

const fallbackCategoryStyle = {
  icon: Keyboard,
  className:
    "border-stone-200 bg-stone-50 text-stone-950 hover:border-amber-300 hover:bg-amber-50",
};

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function resolveProductSort(value: string | string[] | undefined) {
  const sort = getSingleParam(value);

  return productSorts.includes(sort as CatalogProductSort)
    ? (sort as CatalogProductSort)
    : "newest";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const searchQuery = getSingleParam(params?.q);
  const normalizedSearchQuery = searchQuery?.trim() ?? "";
  const selectedBrand = getSingleParam(params?.brand)?.trim() ?? "";
  const selectedCategory = getSingleParam(params?.category)?.trim() ?? "";
  const selectedSort = resolveProductSort(params?.sort);
  const minPrice = getSingleParam(params?.minPrice)?.trim() ?? "";
  const maxPrice = getSingleParam(params?.maxPrice)?.trim() ?? "";
  const inStock = getSingleParam(params?.inStock) === "true";
  const featured = getSingleParam(params?.featured) === "true";
  const hasCatalogFilters =
    Boolean(normalizedSearchQuery) ||
    Boolean(selectedBrand) ||
    Boolean(selectedCategory) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStock ||
    featured ||
    selectedSort !== "newest";
  const dictionary = getDictionary(locale);
  const [categories, brands, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogBrands(),
    hasCatalogFilters
      ? getCatalogProducts({
          q: normalizedSearchQuery,
          brand: selectedBrand,
          category: selectedCategory,
          sort: selectedSort,
          minPrice,
          maxPrice,
          inStock,
          featured,
        })
      : getFeaturedProducts(),
  ]);

  return (
    <main className="min-h-screen bg-[#fff8ed] text-stone-950">
      <SiteHeader
        dictionary={dictionary}
        locale={locale}
        searchQuery={normalizedSearchQuery}
      />

      <HeroCarousel dictionary={dictionary} />

      <section id="categories" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {categories.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            {categories.map((category) => {
              const style = categoryStyles[category.slug] ?? fallbackCategoryStyle;
              const Icon = style.icon;

              return (
                <Link
                  key={category.id}
                  href={`/products?lang=${locale}&category=${category.slug}#featured-products`}
                  className={`group inline-flex h-14 w-fit items-center gap-3 rounded-full border px-3.5 pr-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.className}`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/80 shadow-sm ring-1 ring-black/5 transition group-hover:scale-105">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-6 text-sm text-stone-600">
            Chua co danh muc tu database.
          </div>
        )}
      </section>

      <section id="featured-products" className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8 lg:pb-16">
        <div className="mb-6 grid gap-4 lg:flex lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-800">
              {hasCatalogFilters ? "Danh sach san pham" : dictionary.home.featuredLabel}
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-stone-950">
              {normalizedSearchQuery
                ? `San pham phu hop voi "${normalizedSearchQuery}"`
                : hasCatalogFilters
                  ? "Loc va sap xep san pham"
                : dictionary.home.featuredTitle}
            </h2>
          </div>
          <ProductFilters
            brands={brands}
            categories={categories}
            locale={locale}
            searchQuery={normalizedSearchQuery}
            selectedBrand={selectedBrand}
            selectedCategory={selectedCategory}
            selectedSort={selectedSort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            featured={featured}
          />
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} dictionary={dictionary} />
        ) : (
          <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-6 text-sm text-stone-600">
            {normalizedSearchQuery
              ? "Khong tim thay san pham phu hop."
              : hasCatalogFilters
                ? "Khong co san pham nao khop voi bo loc."
                : "Chua co san pham noi bat tu database."}
          </div>
        )}
      </section>
    </main>
  );
}
