export default function ProductsLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-10 w-64 animate-pulse rounded-lg bg-[var(--surface)]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
