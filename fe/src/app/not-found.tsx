import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <p className="text-6xl font-bold text-[var(--primary)]">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-[var(--foreground)]">
        Trang không tồn tại
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Trang bạn tìm kiếm có thể đã bị xóa hoặc không khả dụng.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-lg bg-[var(--primary)] px-6 py-3 text-sm font-medium text-white transition hover:opacity-90"
      >
        Về trang chủ
      </Link>
    </main>
  );
}
