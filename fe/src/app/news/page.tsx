import Link from "next/link";
import { CalendarDays, ChevronRight, Newspaper, Tags } from "lucide-react";

import { getNewsArticles } from "@/features/catalog/api/catalog-api";
import { getDictionary, resolveLocale, type Locale } from "@/shared/i18n";
import { SiteHeader } from "@/widgets/site-header";
import { SiteFooter } from "@/widgets/site-footer";

type NewsPageProps = {
  searchParams?: Promise<{
    lang?: string | string[];
  }>;
};

type NewsArticle = {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  href: string;
};

const pageCopy: Record<
  Locale,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
    latestLabel: string;
    readMore: string;
    viewProducts: string;
    spotlightTitle: string;
    spotlightDescription: string;
    topicsTitle: string;
    topics: string[];
    articles: NewsArticle[];
  }
> = {
  vi: {
    eyebrow: "NovaTech Newsroom",
    title: "Tin tức công nghệ và gợi ý mua sắm",
    subtitle:
      "Cập nhật sản phẩm mới, xu hướng thiết bị và các combo đáng cân nhắc trước khi chọn laptop, smartphone, màn hình hoặc phụ kiện.",
    latestLabel: "Bài mới",
    readMore: "Xem sản phẩm liên quan",
    viewProducts: "Khám phá sản phẩm",
    spotlightTitle: "Tech Week 07/2026",
    spotlightDescription:
      "NovaTech tổng hợp các cấu hình vừa lên kệ, ưu đãi theo nhóm nhu cầu và mẹo chọn thiết bị thực tế cho học tập, văn phòng, sáng tạo.",
    topicsTitle: "Chủ đề nổi bật",
    topics: ["Laptop AI", "Flagship camera", "Setup làm việc", "Phụ kiện USB-C"],
    articles: [
      {
        category: "Laptop",
        title: "MacBook Air M4: lựa chọn mỏng nhẹ cho học tập và văn phòng",
        excerpt:
          "Điểm mạnh nằm ở pin lâu, hiệu năng ổn định và độ gọn khi di chuyển hằng ngày.",
        date: "06/07/2026",
        href: "/products?category=laptop",
      },
      {
        category: "Smartphone",
        title: "Galaxy S26 Ultra phù hợp với ai?",
        excerpt:
          "Gợi ý nhanh cho người cần camera linh hoạt, màn hình lớn và xử lý tác vụ nặng trên di động.",
        date: "04/07/2026",
        href: "/products?category=smartphone",
      },
      {
        category: "Workdesk",
        title: "Combo màn hình 4K và phụ kiện giúp bàn làm việc gọn hơn",
        excerpt:
          "Một hướng nâng cấp dễ bắt đầu cho designer, developer và đội văn phòng.",
        date: "02/07/2026",
        href: "/products?category=monitor",
      },
    ],
  },
  en: {
    eyebrow: "NovaTech Newsroom",
    title: "Tech news and buying notes",
    subtitle:
      "Fresh product updates, device trends, and practical bundles before choosing laptops, smartphones, monitors, or accessories.",
    latestLabel: "Latest stories",
    readMore: "View related products",
    viewProducts: "Explore products",
    spotlightTitle: "Tech Week 07/2026",
    spotlightDescription:
      "NovaTech rounds up new configurations, demand-based offers, and practical buying notes for study, office, and creative work.",
    topicsTitle: "Featured topics",
    topics: ["AI laptops", "Camera flagships", "Work setups", "USB-C accessories"],
    articles: [
      {
        category: "Laptop",
        title: "MacBook Air M4: a thin and light pick for study and office work",
        excerpt:
          "Its strengths are long battery life, steady performance, and everyday portability.",
        date: "07/06/2026",
        href: "/products?category=laptop",
      },
      {
        category: "Smartphone",
        title: "Who should consider Galaxy S26 Ultra?",
        excerpt:
          "A quick guide for users who need flexible cameras, a large display, and strong mobile performance.",
        date: "07/04/2026",
        href: "/products?category=smartphone",
      },
      {
        category: "Workdesk",
        title: "A 4K monitor and accessory bundle for a cleaner desk",
        excerpt:
          "An easy upgrade path for designers, developers, and office teams.",
        date: "07/02/2026",
        href: "/products?category=monitor",
      },
    ],
  },
  zh: {
    eyebrow: "NovaTech 资讯中心",
    title: "科技资讯与购买建议",
    subtitle:
      "更新新品、设备趋势和实用组合，帮助你选择笔记本、智能手机、显示器或配件。",
    latestLabel: "最新文章",
    readMore: "查看相关商品",
    viewProducts: "浏览商品",
    spotlightTitle: "2026 年 7 月科技周",
    spotlightDescription:
      "NovaTech 汇总新品配置、按需求划分的优惠，以及适合学习、办公和创作的购买建议。",
    topicsTitle: "热门主题",
    topics: ["AI 笔记本", "旗舰影像", "办公桌搭", "USB-C 配件"],
    articles: [
      {
        category: "笔记本",
        title: "MacBook Air M4：适合学习和办公的轻薄选择",
        excerpt: "优势在于长续航、稳定性能和日常携带的便利性。",
        date: "2026/07/06",
        href: "/products?category=laptop",
      },
      {
        category: "智能手机",
        title: "Galaxy S26 Ultra 适合哪些用户？",
        excerpt: "适合需要灵活相机、大屏幕和高性能移动体验的用户。",
        date: "2026/07/04",
        href: "/products?category=smartphone",
      },
      {
        category: "桌搭",
        title: "4K 显示器和配件组合，让桌面更清爽",
        excerpt: "适合设计师、开发者和办公团队的简洁升级方案。",
        date: "2026/07/02",
        href: "/products?category=monitor",
      },
    ],
  },
};

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams;
  const locale = resolveLocale(params?.lang);
  const dictionary = getDictionary(locale);
  const copy = pageCopy[locale];
  const dbArticles = await getNewsArticles();
  const articles =
    dbArticles.length > 0
      ? dbArticles.map((article) => ({
          category: article.category ?? "NovaTech",
          title: article.title,
          excerpt: article.excerpt ?? article.content ?? "",
          date: formatNewsDate(article.publishedAt),
          href: article.href ?? "/products",
        }))
      : copy.articles;

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-between">
      <div>
        <SiteHeader dictionary={dictionary} locale={locale} />

      <section className="border-b border-[var(--border)] bg-[var(--surface-soft)]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-14">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]">
              <Newspaper className="h-4 w-4" aria-hidden="true" />
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--foreground)] sm:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-4 text-base leading-7 text-[var(--muted)]">
              {copy.subtitle}
            </p>
            <Link
              href={`/products?lang=${locale}`}
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {copy.viewProducts}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <aside className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
            <p className="text-sm font-semibold text-[var(--primary)]">
              {copy.spotlightTitle}
            </p>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {copy.spotlightDescription}
            </p>
            <div className="mt-5">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                <Tags className="h-4 w-4" aria-hidden="true" />
                {copy.topicsTitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {copy.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-[var(--badge-bg)] px-3 py-1 text-xs font-semibold text-[var(--badge-text)]"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-12">
        <h2 className="mb-6 text-2xl font-semibold text-[var(--foreground)]">
          {dictionary.nav.news}
        </h2>

        <div className="grid gap-4 lg:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article.title}
              className="flex min-h-72 flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-[var(--foreground)] px-3 py-1 text-xs font-semibold text-[var(--background)]">
                  {article.category}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {article.date}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold leading-snug text-[var(--foreground)]">
                {article.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-[var(--muted)]">
                {article.excerpt}
              </p>
              <Link
                href={`${article.href}&lang=${locale}#featured-products`}
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] transition hover:opacity-80"
              >
                {copy.readMore}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      </div>
      <SiteFooter dictionary={dictionary} locale={locale} />
    </main>
  );
}

function formatNewsDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}
