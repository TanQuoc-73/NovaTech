import type { ReactNode } from "react";

export function PageSkeleton({
  eyebrowWidth = "w-24",
  titleWidth = "w-64",
  description = false,
  cards = 4,
  children,
}: {
  eyebrowWidth?: string;
  titleWidth?: string;
  description?: boolean;
  cards?: number;
  children?: ReactNode;
}) {
  return (
    <section aria-busy="true" className="animate-pulse">
      <div>
        <div className={`h-4 rounded bg-cyan-100 ${eyebrowWidth}`} />
        <div className={`mt-3 h-9 rounded bg-slate-200 ${titleWidth}`} />
        {description ? (
          <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-100" />
        ) : null}
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {Array.from({ length: cards }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-slate-950/10 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="h-4 w-24 rounded bg-slate-100" />
              <div className="h-10 w-10 rounded-full bg-cyan-100" />
            </div>
            <div className="mt-4 h-8 w-20 rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {children ?? <TableSkeleton className="mt-8" />}
    </section>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
  className = "",
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      aria-busy="true"
      className={`animate-pulse overflow-hidden rounded-lg border border-slate-950/10 bg-white shadow-sm ${className}`}
    >
      <div
        className="grid gap-4 border-b border-slate-950/10 bg-slate-50 px-4 py-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-3 rounded bg-slate-200" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 border-b border-slate-950/10 px-4 py-4 last:border-b-0"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <div
              key={columnIndex}
              className={`h-4 rounded bg-slate-100 ${
                columnIndex === 0 ? "w-4/5" : "w-full"
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({
  rows = 4,
  className = "",
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div aria-busy="true" className={`animate-pulse space-y-4 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-slate-950/10 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-5 w-40 rounded bg-slate-200" />
              <div className="mt-3 h-4 w-64 max-w-full rounded bg-slate-100" />
              <div className="mt-3 h-4 w-4/5 rounded bg-slate-100" />
            </div>
            <div className="h-8 w-24 rounded bg-cyan-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <section
      aria-busy="true"
      className="mx-auto max-w-7xl animate-pulse px-6 py-12 lg:px-8"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-slate-950/10 bg-white p-6 shadow-sm">
          <div className="h-7 w-52 rounded bg-slate-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index}>
                <div className="h-3 w-24 rounded bg-slate-100" />
                <div className="mt-2 h-11 rounded-md bg-slate-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="h-fit rounded-lg border border-slate-950/10 bg-white p-5 shadow-sm">
          <div className="h-6 w-40 rounded bg-slate-200" />
          <div className="mt-5 space-y-4">
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-4 rounded bg-slate-100" />
            <div className="h-10 rounded-md bg-cyan-100" />
          </div>
        </div>
      </div>
    </section>
  );
}
