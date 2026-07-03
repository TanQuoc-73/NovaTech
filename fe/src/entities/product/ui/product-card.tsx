import type { Product } from "@/entities/product/model/types";
import { formatCurrency } from "@/shared/lib/format-currency";
import type { Dictionary } from "@/shared/i18n";
import { Scale } from "lucide-react";

type ProductCardProps = {
  product: Product;
  dictionary: Dictionary;
  onSelect?: (product: Product) => void;
  onCompareToggle?: (product: Product) => void;
  isCompareSelected?: boolean;
  compareState?: "idle" | "compatible" | "incompatible";
};

export function ProductCard({
  product,
  dictionary,
  onSelect,
  onCompareToggle,
  isCompareSelected = false,
  compareState = "idle",
}: ProductCardProps) {
  const categoryLabel =
    product.category in dictionary.categories
      ? dictionary.categories[
          product.category as keyof typeof dictionary.categories
        ]
      : product.category;

  return (
    <article
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect?.(product)}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(product);
        }
      }}
      className={`group relative grid min-h-[300px] cursor-pointer rounded-lg border bg-[#fffdf7] p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-700/40 focus:outline-none focus:ring-4 focus:ring-amber-300/60 sm:min-h-[360px] sm:p-4 ${
        isCompareSelected
          ? "border-amber-700 ring-2 ring-amber-300/70"
          : compareState === "compatible"
            ? "border-amber-500/70 shadow-md shadow-amber-900/10 ring-2 ring-amber-200/80"
            : "border-amber-900/10"
      } ${
        compareState === "incompatible"
          ? "opacity-35 grayscale-[0.35] hover:opacity-60"
          : ""
      }`}
    >
      {onCompareToggle ? (
        <button
          type="button"
          aria-label={dictionary.ui.compare.action}
          aria-pressed={isCompareSelected}
          disabled={compareState === "incompatible"}
          title={dictionary.ui.compare.action}
          onClick={(event) => {
            event.stopPropagation();
            if (compareState === "incompatible") {
              return;
            }
            onCompareToggle(product);
          }}
          className={`absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border shadow-lg transition focus:opacity-100 focus:outline-none focus:ring-4 focus:ring-amber-300/70 ${
            isCompareSelected
              ? "border-amber-700 bg-amber-600 text-white opacity-100"
              : compareState === "compatible"
                ? "border-amber-600 bg-amber-100 text-amber-900 opacity-100"
                : compareState === "incompatible"
                  ? "cursor-not-allowed border-stone-200 bg-white/90 text-stone-300 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              : "border-amber-900/10 bg-white/95 text-stone-700 opacity-0 hover:border-amber-700 hover:text-amber-900 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          <Scale className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      <div className="flex h-[7.5rem] items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 sm:h-40">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-1 sm:object-cover sm:p-0"
          />
        ) : (
          <span className="text-center text-sm font-semibold text-stone-500">
            {product.brand}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
        {product.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-sm bg-amber-100 px-1.5 py-1 text-[11px] font-semibold text-amber-800 sm:px-2 sm:text-xs"
          >
            {badge in dictionary.badges
              ? dictionary.badges[badge as keyof typeof dictionary.badges]
              : badge}
          </span>
        ))}
      </div>

      <div className="mt-3">
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 sm:text-xs sm:tracking-[0.12em]">
          {categoryLabel}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-stone-950 sm:mt-2 sm:text-base">
          {product.name}
        </h3>
      </div>

      <div className="mt-3 self-end sm:mt-4">
        <div className="grid gap-1 sm:flex sm:items-baseline sm:gap-2">
          <p className="text-sm font-semibold text-stone-950 sm:text-lg">
            {formatCurrency(product.price)}
          </p>
          {product.compareAtPrice ? (
            <p className="text-xs text-stone-400 line-through sm:text-sm">
              {formatCurrency(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
        <div className="mt-2 grid gap-1 text-[11px] text-stone-600 sm:mt-3 sm:flex sm:items-center sm:justify-between sm:text-sm">
          <span>
            {product.rating.toFixed(1)} {dictionary.common.rating}
          </span>
          <span>
            {product.stock} {dictionary.common.inStock}
          </span>
        </div>
      </div>
    </article>
  );
}
