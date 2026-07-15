"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <h1 className="text-2xl font-bold text-[var(--foreground)]">
        Đã xảy ra lỗi
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Vui lòng thử lại sau.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 inline-block rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Thử lại
      </button>
    </main>
  );
}
