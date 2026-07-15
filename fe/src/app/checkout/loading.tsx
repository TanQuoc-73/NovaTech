export default function CheckoutLoading() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-[var(--surface)]" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-[var(--border)] bg-[var(--surface)]"
            />
          ))}
        </div>
      </div>
    </main>
  );
}
