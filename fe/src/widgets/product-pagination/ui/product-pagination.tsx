"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductPaginationProps = {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  basePath: string;
  searchParams?: Record<string, string | string[] | undefined>;
};

export function ProductPagination({
  currentPage,
  totalPages,
  totalProducts,
  basePath,
  searchParams = {},
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  function buildUrl(page: number) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page") continue;
      if (value !== undefined && value !== "") {
        params.set(key, String(Array.isArray(value) ? value[0] : value));
      }
    }

    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-[var(--muted)]">
        {totalProducts} sản phẩm
      </p>

      <div className="flex items-center gap-1.5">
        {currentPage > 1 ? (
          <a
            href={buildUrl(currentPage - 1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </a>
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}

        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-1 text-sm text-[var(--muted)]">
              ...
            </span>
          ) : (
            <a
              key={page}
              href={buildUrl(page as number)}
              className={`grid h-9 min-w-9 place-items-center rounded-lg px-2.5 text-sm font-semibold transition ${
                page === currentPage
                  ? "bg-[var(--primary)] text-white shadow-sm"
                  : "border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
              }`}
            >
              {page}
            </a>
          ),
        )}

        {currentPage < totalPages ? (
          <a
            href={buildUrl(currentPage + 1)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
          >
            <ChevronRight className="h-4 w-4" />
          </a>
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--border)] text-[var(--muted)] opacity-30">
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

function getPageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];
  pages.push(1);

  if (current > 3) {
    pages.push("...");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("...");
  }

  pages.push(total);

  return pages;
}
