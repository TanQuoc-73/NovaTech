import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

import type {
  CatalogBrand,
  CatalogCategory,
  CatalogProductSort,
} from "@/features/catalog/api/catalog-api";
import type { Dictionary, Locale } from "@/shared/i18n";

type ProductFiltersProps = {
  brands: CatalogBrand[];
  categories: CatalogCategory[];
  locale: Locale;
  dictionary: Dictionary;
  searchQuery: string;
  selectedBrand: string;
  selectedCategory: string;
  selectedSort: CatalogProductSort;
  minPrice: string;
  maxPrice: string;
  inStock: boolean;
  featured: boolean;
  actionPath?: string;
};

const sortOptions: Array<{
  value: CatalogProductSort;
  labelKey: keyof Dictionary["ui"]["filters"]["sort"];
}> = [
  { value: "newest", labelKey: "newest" },
  { value: "price_asc", labelKey: "priceAsc" },
  { value: "price_desc", labelKey: "priceDesc" },
  { value: "name_asc", labelKey: "nameAsc" },
  { value: "stock_desc", labelKey: "stockDesc" },
];

export function ProductFilters({
  brands,
  categories,
  locale,
  dictionary,
  searchQuery,
  selectedBrand,
  selectedCategory,
  selectedSort,
  minPrice,
  maxPrice,
  inStock,
  featured,
  actionPath = "/",
}: ProductFiltersProps) {
  const hasActiveFilters =
    Boolean(selectedBrand) ||
    Boolean(selectedCategory) ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    inStock ||
    featured ||
    selectedSort !== "newest";

  return (
    <>
      <details className="group w-full rounded-lg border border-amber-900/10 bg-[#fffdf7] sm:hidden">
        <summary
          aria-label={dictionary.ui.listing.filteredTitle}
          className="flex h-11 cursor-pointer list-none items-center justify-between gap-3 px-3 text-sm font-semibold text-stone-800 [&::-webkit-details-marker]:hidden"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-100 text-amber-900">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-amber-800">
            {hasActiveFilters ? dictionary.ui.filters.active : null}
            <span className="transition group-open:rotate-180">v</span>
          </span>
        </summary>
        <form
          action={`${actionPath}#featured-products`}
          className="grid grid-cols-2 gap-2 border-t border-amber-900/10 p-3"
        >
          <FilterFields
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
            actionPath={actionPath}
          />
        </form>
      </details>

      <form
        action={`${actionPath}#featured-products`}
        className="hidden w-full flex-wrap items-center justify-end gap-2 sm:flex"
      >
        <FilterFields
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
          actionPath={actionPath}
        />
      </form>
    </>
  );
}

function FilterFields({
  brands,
  categories,
  locale,
  dictionary,
  searchQuery,
  selectedBrand,
  selectedCategory,
  selectedSort,
  minPrice,
  maxPrice,
  inStock,
  featured,
  actionPath,
}: ProductFiltersProps & { actionPath: string }) {
  return (
    <>
      <input type="hidden" name="lang" value={locale} />
      {searchQuery ? <input type="hidden" name="q" value={searchQuery} /> : null}

      <select
        name="brand"
        defaultValue={selectedBrand}
        aria-label={dictionary.ui.filters.brandAll}
        className="h-10 min-w-0 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 outline-none transition hover:border-amber-700 focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      >
        <option value="">{dictionary.ui.filters.brandAll}</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.slug}>
            {brand.name}
          </option>
        ))}
      </select>

      <input
        name="minPrice"
        defaultValue={minPrice}
        inputMode="numeric"
        placeholder={dictionary.ui.filters.minPrice}
        aria-label={dictionary.ui.filters.minPrice}
        className="h-10 min-w-0 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 hover:border-amber-700 focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70 sm:w-28"
      />

      <input
        name="maxPrice"
        defaultValue={maxPrice}
        inputMode="numeric"
        placeholder={dictionary.ui.filters.maxPrice}
        aria-label={dictionary.ui.filters.maxPrice}
        className="h-10 min-w-0 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 hover:border-amber-700 focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70 sm:w-28"
      />

      <label className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 transition hover:border-amber-700">
        <input
          name="inStock"
          type="checkbox"
          value="true"
          defaultChecked={inStock}
          className="h-4 w-4 accent-amber-700"
        />
        {dictionary.ui.filters.inStock}
      </label>

      <label className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 transition hover:border-amber-700">
        <input
          name="featured"
          type="checkbox"
          value="true"
          defaultChecked={featured}
          className="h-4 w-4 accent-amber-700"
        />
        {dictionary.ui.filters.featured}
      </label>

      <select
        name="category"
        defaultValue={selectedCategory}
        aria-label={dictionary.ui.filters.categoryAll}
        className="h-10 min-w-0 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 outline-none transition hover:border-amber-700 focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      >
        <option value="">{dictionary.ui.filters.categoryAll}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <select
        name="sort"
        defaultValue={selectedSort}
        aria-label={dictionary.ui.filters.sort.newest}
        className="h-10 min-w-0 rounded-md border border-amber-900/15 bg-[#fffdf7] px-3 text-sm font-semibold text-stone-800 outline-none transition hover:border-amber-700 focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {dictionary.ui.filters.sort[option.labelKey]}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-10 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
      >
        {dictionary.ui.filters.apply}
      </button>

      <Link
        href={`${actionPath}?lang=${locale}#featured-products`}
        className="inline-flex h-10 items-center justify-center rounded-md border border-amber-900/15 px-4 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800"
      >
        {dictionary.ui.filters.clear}
      </Link>
    </>
  );
}
