import type { Product } from "@/entities/product/model/types";
import { formatCurrency } from "@/shared/lib/format-currency";
import type { Dictionary } from "@/shared/i18n";

type ProductCardProps = {
  product: Product;
  dictionary: Dictionary;
  onSelect?: (product: Product) => void;
};

export function ProductCard({ product, dictionary, onSelect }: ProductCardProps) {
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
      className="grid min-h-[300px] cursor-pointer rounded-lg border border-amber-900/10 bg-[#fffdf7] p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-700/40 focus:outline-none focus:ring-4 focus:ring-amber-300/60 sm:min-h-[360px] sm:p-4"
    >
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
