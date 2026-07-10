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
      <details className="group w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] sm:hidden">
        <summary
          aria-label={dictionary.ui.listing.filteredTitle}
          className="flex h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-sm font-semibold text-[var(--foreground)] [&::-webkit-details-marker]:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <SlidersHorizontal className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            {dictionary.ui.filters.apply}
          </span>
          <span className="flex items-center gap-2 text-xs font-semibold text-[var(--primary)]">
            {hasActiveFilters ? dictionary.ui.filters.active : null}
            <span className="transition group-open:rotate-180">▼</span>
          </span>
        </summary>
        <form
          action={`${actionPath}#featured-products`}
          className="grid grid-cols-2 gap-2 border-t border-[var(--border)] p-4"
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
        className="hidden flex-wrap items-center gap-2 sm:flex"
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
  const fieldClass =
    "h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--primary)]/50 focus:border-[var(--primary)] focus:ring-3 focus:ring-[var(--primary)]/20";

  return (
    <>
      <input type="hidden" name="lang" value={locale} />
      {searchQuery ? <input type="hidden" name="q" value={searchQuery} /> : null}

      <select
        name="brand"
        defaultValue={selectedBrand}
        aria-label={dictionary.ui.filters.brandAll}
        className={fieldClass}
      >
        <option value="">{dictionary.ui.filters.brandAll}</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.slug}>
            {brand.name}
          </option>
        ))}
      </select>

      <select
        name="category"
        defaultValue={selectedCategory}
        aria-label={dictionary.ui.filters.categoryAll}
        className={fieldClass}
      >
        <option value="">{dictionary.ui.filters.categoryAll}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.slug}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        name="minPrice"
        defaultValue={minPrice}
        inputMode="numeric"
        placeholder={dictionary.ui.filters.minPrice}
        aria-label={dictionary.ui.filters.minPrice}
        className={`${fieldClass} w-28`}
      />

      <input
        name="maxPrice"
        defaultValue={maxPrice}
        inputMode="numeric"
        placeholder={dictionary.ui.filters.maxPrice}
        aria-label={dictionary.ui.filters.maxPrice}
        className={`${fieldClass} w-28`}
      />

      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]/50">
        <input
          name="inStock"
          type="checkbox"
          value="true"
          defaultChecked={inStock}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        {dictionary.ui.filters.inStock}
      </label>

      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]/50">
        <input
          name="featured"
          type="checkbox"
          value="true"
          defaultChecked={featured}
          className="h-4 w-4 accent-[var(--primary)]"
        />
        {dictionary.ui.filters.featured}
      </label>

      <select
        name="sort"
        defaultValue={selectedSort}
        aria-label={dictionary.ui.filters.sort.newest}
        className={fieldClass}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {dictionary.ui.filters.sort[option.labelKey]}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-10 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
      >
        {dictionary.ui.filters.apply}
      </button>

      <Link
        href={`${actionPath}?lang=${locale}#featured-products`}
        className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
      >
        {dictionary.ui.filters.clear}
      </Link>
    </>
  );
}
