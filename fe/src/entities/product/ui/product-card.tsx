import type { Product } from "@/entities/product/model/types";
import { formatCurrency } from "@/shared/lib/format-currency";
import type { Dictionary } from "@/shared/i18n";
import { Heart, Scale, ShoppingCart } from "lucide-react";

type ProductCardProps = {
  product: Product;
  dictionary: Dictionary;
  onSelect?: (product: Product) => void;
  onCompareToggle?: (product: Product) => void;
  isCompareSelected?: boolean;
  compareState?: "idle" | "compatible" | "incompatible";
  isWishlisted?: boolean;
  onWishlistToggle?: (product: Product) => void;
};

export function ProductCard({
  product,
  dictionary,
  onSelect,
  onCompareToggle,
  isCompareSelected = false,
  compareState = "idle",
  isWishlisted = false,
  onWishlistToggle,
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
      className={`group relative grid min-h-[300px] cursor-pointer rounded-xl border bg-[var(--surface)] p-2.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:min-h-[360px] sm:p-4 ${
        isCompareSelected
          ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40"
          : compareState === "compatible"
            ? "border-[var(--primary)]/50 shadow-md ring-2 ring-[var(--primary)]/20"
            : "border-[var(--border)] hover:border-[var(--primary)]/40"
      } ${
        compareState === "incompatible"
          ? "opacity-35 grayscale-[0.35] hover:opacity-60"
          : ""
      }`}
    >
      {onWishlistToggle ? (
        <button
          type="button"
          aria-label={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          aria-pressed={isWishlisted}
          title={isWishlisted ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
          onClick={(event) => {
            event.stopPropagation();
            onWishlistToggle(product);
          }}
          className={`absolute left-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/40 ${
            isWishlisted
              ? "border-red-200 bg-red-50 text-red-600 opacity-100"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-0 hover:border-red-400 hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} aria-hidden="true" />
        </button>
      ) : null}

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
          className={`absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/40 ${
            isCompareSelected
              ? "bg-[var(--primary)] text-white opacity-100"
              : compareState === "compatible"
                ? "border-[var(--primary)] bg-[var(--badge-bg)] text-[var(--badge-text)] opacity-100"
                : compareState === "incompatible"
                  ? "cursor-not-allowed border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] opacity-0 hover:border-[var(--primary)] hover:text-[var(--primary)] group-hover:opacity-100 group-focus-within:opacity-100"
          }`}
        >
          <Scale className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      <div className="flex h-[7.5rem] items-center justify-center overflow-hidden rounded-lg bg-[var(--image-bg)] sm:h-40">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-contain p-1 transition-transform duration-500 group-hover:scale-110 sm:object-cover sm:p-0"
          />
        ) : (
          <span className="text-center text-sm font-semibold text-[var(--muted)]">
            {product.brand}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2">
        {product.badges.map((badge) => (
          <span
            key={badge}
            className="rounded-md bg-[var(--badge-bg)] px-1.5 py-1 text-[11px] font-semibold text-[var(--badge-text)] sm:px-2 sm:text-xs"
          >
            {badge in dictionary.badges
              ? dictionary.badges[badge as keyof typeof dictionary.badges]
              : badge}
          </span>
        ))}
      </div>

      <div className="mt-3">
        <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)] sm:text-xs sm:tracking-[0.12em]">
          {categoryLabel}
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-sm font-semibold text-[var(--foreground)] sm:mt-2 sm:text-base">
          {product.name}
        </h3>
      </div>

      <div className="mt-3 self-end sm:mt-4">
        <div className="grid gap-1 sm:flex sm:items-baseline sm:gap-2">
          <p className="text-sm font-semibold text-[var(--foreground)] sm:text-lg">
            {formatCurrency(product.price)}
          </p>
          {product.compareAtPrice ? (
            <p className="text-xs text-[var(--muted)] line-through sm:text-sm">
              {formatCurrency(product.compareAtPrice)}
            </p>
          ) : null}
        </div>
        <div className="mt-2 grid gap-1 text-[11px] text-[var(--muted)] sm:mt-3 sm:flex sm:items-center sm:justify-between sm:text-sm">
          <span className="flex items-center gap-1">
            <span className="text-[var(--primary)]">★</span>
            {product.rating.toFixed(1)}
          </span>
          <span>
            {product.stock > 0
              ? `${product.stock} ${dictionary.common.inStock}`
              : dictionary.ui.product.outOfStock}
          </span>
        </div>
      </div>
    </article>
  );
}
