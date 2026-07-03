"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import type { Product } from "@/entities/product";
import type { Dictionary } from "@/shared/i18n";
import { ProductGrid } from "@/widgets/product-grid";

type FeaturedProductCarouselProps = {
  products: Product[];
  dictionary: Dictionary;
};

const pageSize = 4;

export function FeaturedProductCarousel({
  products,
  dictionary,
}: FeaturedProductCarouselProps) {
  const [activePage, setActivePage] = useState(0);
  const pages = useMemo(() => {
    const chunks: Product[][] = [];

    for (let index = 0; index < products.length; index += pageSize) {
      chunks.push(products.slice(index, index + pageSize));
    }

    return chunks;
  }, [products]);
  const canSlide = pages.length > 1;
  const isFirstPage = activePage === 0;
  const isLastPage = activePage === pages.length - 1;

  function handlePreviousPage() {
    setActivePage((page) => Math.max(page - 1, 0));
  }

  function handleNextPage() {
    setActivePage((page) => Math.min(page + 1, pages.length - 1));
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {pages.map((pageProducts, index) => (
            <div
              key={index}
              className="w-full shrink-0"
              aria-hidden={activePage !== index}
            >
              <ProductGrid products={pageProducts} dictionary={dictionary} />
            </div>
          ))}
        </div>
      </div>

      {canSlide ? (
        <>
          {!isFirstPage ? (
            <button
              type="button"
              aria-label={dictionary.home.viewAll}
              onClick={handlePreviousPage}
              className="absolute left-2 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cyan-500/20 bg-white/80 text-cyan-700 opacity-35 shadow-lg shadow-slate-950/10 backdrop-blur transition hover:-translate-y-1/2 hover:scale-105 hover:border-cyan-500/40 hover:bg-white hover:text-cyan-600 hover:opacity-100 group-hover/featured:opacity-75 sm:left-4 lg:-left-6"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
          {!isLastPage ? (
            <button
              type="button"
              aria-label={dictionary.home.viewAll}
              onClick={handleNextPage}
              className="absolute right-2 top-1/2 z-20 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-cyan-500/20 bg-white/80 text-cyan-700 opacity-35 shadow-lg shadow-slate-950/10 backdrop-blur transition hover:-translate-y-1/2 hover:scale-105 hover:border-cyan-500/40 hover:bg-white hover:text-cyan-600 hover:opacity-100 group-hover/featured:opacity-75 sm:right-4 lg:-right-6"
            >
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
