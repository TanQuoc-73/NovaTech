"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, X } from "lucide-react";

import { ProductCard, type Product } from "@/entities/product";
import { addCartItem } from "@/features/cart/api/cart-api";
import type { Cart } from "@/features/cart/api/cart-api";
import { formatCurrency } from "@/shared/lib/format-currency";
import type { Dictionary } from "@/shared/i18n";

type ProductGridProps = {
  products: Product[];
  dictionary: Dictionary;
};

export function ProductGrid({ products, dictionary }: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedProduct(null);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct]);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            dictionary={dictionary}
            onSelect={setSelectedProduct}
          />
        ))}
      </div>

      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          dictionary={dictionary}
          onClose={() => setSelectedProduct(null)}
        />
      ) : null}
    </>
  );
}

type ProductDetailModalProps = {
  product: Product;
  dictionary: Dictionary;
  onClose: () => void;
};

function ProductDetailModal({
  product,
  dictionary,
  onClose,
}: ProductDetailModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id ?? "",
  );
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants[0];
  const categoryLabel =
    product.category in dictionary.categories
      ? dictionary.categories[
          product.category as keyof typeof dictionary.categories
        ]
      : product.category;

  const displayPrice = selectedVariant?.price ?? product.price;
  const displayCompareAtPrice =
    selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const displayStock = selectedVariant?.stock ?? product.stock;
  const displayImageUrl = selectedVariant?.images[0]?.imageUrl ?? product.imageUrl;
  const stockStatus =
    displayStock > 0
      ? `${displayStock} ${dictionary.common.inStock}`
      : dictionary.ui.product.outOfStock;
  const canAddToCart = Boolean(selectedVariant) && displayStock > 0;

  async function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    if (!selectedVariant || isAddingToCart) {
      return;
    }

    const sourceRect = event.currentTarget.getBoundingClientRect();
    setIsAddingToCart(true);
    setCartMessage(null);

    try {
      const cart = await addCartItem(selectedVariant.id, 1);

      setCartMessage(
        dictionary.ui.product.addedToCart.replace(
          "{count}",
          String(cart.totalQuantity),
        ),
      );
      window.dispatchEvent(
        new CustomEvent<CartUpdatedEventDetail>("novatech:cart-updated", {
          detail: {
            cart,
            productName: product.name,
            productBrand: product.brand,
            sourceRect: {
              x: sourceRect.left + sourceRect.width / 2,
              y: sourceRect.top + sourceRect.height / 2,
            },
          },
        }),
      );
    } catch {
      setCartMessage(dictionary.ui.product.addFailed);
    } finally {
      setIsAddingToCart(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/70 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6">
      <button
        type="button"
        aria-label={dictionary.ui.product.closeDetail}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative grid h-[86dvh] w-full max-w-5xl overflow-hidden rounded-2xl border border-amber-200/60 bg-[#fffaf2] shadow-2xl shadow-stone-950/30 md:h-[720px] md:grid-cols-[1fr_1.08fr]">
        <div className="flex min-h-40 items-center justify-center bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 p-3 sm:min-h-56 sm:p-4 md:min-h-0 md:p-8">
          <div className="grid h-36 w-full max-w-[13rem] place-items-center overflow-hidden rounded-xl border border-amber-900/10 bg-white/80 p-3 text-center shadow-sm sm:h-52 sm:max-w-[18rem] sm:rounded-2xl sm:p-4 md:aspect-square md:h-auto md:max-w-md">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={selectedVariant?.name ?? product.name}
                className="h-full w-full object-contain"
              />
            ) : (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
                  {product.brand}
                </p>
                <p className="mt-3 px-6 text-xl font-semibold text-stone-950">
                  {categoryLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_1fr_auto] bg-[#fffaf2]">
          <div className="border-b border-amber-900/10 p-3 md:p-6 md:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
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

                <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-stone-950 sm:text-xl md:mt-4 md:text-2xl">
                  {product.name}
                </h3>
                <p className="mt-1 truncate text-xs font-semibold text-stone-500 sm:mt-2 sm:text-sm">
                  {product.brand} / {categoryLabel}
                </p>
              </div>

              <button
                type="button"
                aria-label="Dong"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-amber-900/15 text-stone-700 transition hover:bg-amber-100 sm:h-10 sm:w-10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto px-3 py-3 [scrollbar-color:#b45309_#fff3d6] [scrollbar-width:thin] sm:px-4 sm:py-4 md:px-8 md:py-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-600/70 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-amber-100/80">
            <div className="flex flex-wrap items-baseline gap-3">
              <p className="text-xl font-semibold text-stone-950 sm:text-2xl md:text-3xl">
                {formatCurrency(displayPrice)}
              </p>
              {displayCompareAtPrice ? (
                <p className="text-sm text-stone-400 line-through sm:text-base">
                  {formatCurrency(displayCompareAtPrice)}
                </p>
              ) : null}
            </div>
            <div className="mt-3 grid gap-2 text-xs font-semibold text-stone-700 sm:mt-4 sm:grid-cols-2 sm:gap-3 sm:text-sm">
              <p className="rounded-md bg-white/70 px-3 py-2">
                {product.rating.toFixed(1)} {dictionary.common.rating}
              </p>
                <p className="rounded-md bg-white/70 px-3 py-2">{stockStatus}</p>
            </div>

            <div className="mt-4 text-xs text-stone-700 sm:mt-6 sm:text-sm">
              <div
                className={`grid gap-3 ${
                  isDescriptionExpanded ? "" : "line-clamp-3"
                }`}
              >
                <p>
                  {dictionary.ui.product.descriptionIntro.replace(
                    "{category}",
                    categoryLabel,
                  )}
                </p>
                <p>{dictionary.ui.product.descriptionMore}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setIsDescriptionExpanded((current) => !current)
                }
                className="mt-2 text-xs font-semibold text-amber-800 hover:text-amber-900 sm:text-sm"
              >
                {isDescriptionExpanded
                  ? dictionary.ui.product.collapse
                  : dictionary.ui.product.showMore}
              </button>
            </div>

            {product.variants.length > 0 ? (
              <div className="mt-4 sm:mt-6">
                <p className="text-sm font-semibold text-stone-950">
                  {dictionary.ui.product.variants}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3">
                  {product.variants.map((variant) => {
                    const isSelected = variant.id === selectedVariant?.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`grid h-[7.25rem] gap-1.5 rounded-lg border p-1.5 text-left transition sm:h-[8.5rem] sm:gap-2 sm:p-2 ${
                          isSelected
                            ? "border-amber-700 bg-amber-100/80 shadow-sm"
                            : "border-amber-900/10 bg-white/70 hover:border-amber-700/60 hover:bg-amber-50"
                        }`}
                      >
                        <span className="grid h-[3.75rem] place-items-center overflow-hidden rounded-md bg-gradient-to-br from-amber-100 via-orange-50 to-stone-100 p-1 sm:h-[4.5rem]">
                          {variant.images[0]?.imageUrl ? (
                            <img
                              src={variant.images[0].imageUrl}
                              alt={variant.images[0].altText ?? variant.name}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <span className="text-xs font-bold uppercase tracking-[0.12em] text-amber-900">
                              {product.brand.slice(0, 3)}
                            </span>
                          )}
                        </span>
                        <span className="line-clamp-2 text-[11px] font-semibold leading-4 text-stone-900 sm:text-xs sm:leading-5">
                          {variant.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 border-t border-amber-900/10 bg-[#fffaf2] p-3 sm:gap-3 sm:p-4 md:p-6 md:px-8">
            <button
              type="button"
              disabled={!canAddToCart || isAddingToCart}
              onClick={handleAddToCart}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:flex-none sm:px-5"
            >
              <ShoppingCart className="h-4 w-4" aria-hidden="true" />
              {isAddingToCart
                ? dictionary.ui.product.adding
                : dictionary.ui.product.addToCart}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 flex-1 rounded-md border border-amber-900/15 px-4 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800 sm:h-11 sm:flex-none sm:px-5"
            >
              {dictionary.ui.product.continueViewing}
            </button>
            {cartMessage ? (
              <p className="basis-full text-sm font-semibold text-stone-700">
                {cartMessage}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

type CartUpdatedEventDetail = {
  cart: Cart;
  productName: string;
  productBrand: string;
  sourceRect: {
    x: number;
    y: number;
  };
};
