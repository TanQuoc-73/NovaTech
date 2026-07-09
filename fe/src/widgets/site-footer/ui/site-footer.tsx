"use client";

import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
} from "lucide-react";
import type { Dictionary, Locale } from "@/shared/i18n";

type SiteFooterProps = {
  dictionary: Dictionary;
  locale: Locale;
};

export function SiteFooter({ dictionary, locale }: SiteFooterProps) {
  const t = dictionary.footer;

  const categories = [
    { name: locale === "vi" ? "Laptop" : locale === "zh" ? "笔记本电脑" : "Laptops", slug: "laptop" },
    { name: locale === "vi" ? "Điện thoại" : locale === "zh" ? "智能手机" : "Smartphones", slug: "smartphone" },
    { name: locale === "vi" ? "Màn hình & PC" : locale === "zh" ? "显示器与PC" : "Monitors & PCs", slug: "pc" },
    { name: locale === "vi" ? "Phụ kiện" : locale === "zh" ? "配件" : "Accessories", slug: "accessory" },
  ];

  return (
    <footer className="w-full border-t border-[var(--border)] bg-[var(--surface)] transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href={`/?lang=${locale}`} className="inline-block focus:outline-none">
              <img
                src="/NovaTech_daymode.png"
                alt="NovaTech"
                className="logo-light h-9 w-auto object-contain"
              />
              <img
                src="/NovaTech_nightmode.png"
                alt="NovaTech"
                className="logo-dark h-9 w-auto object-contain"
              />
            </Link>
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {t.description}
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition-all hover:bg-[var(--primary)] hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition-all hover:bg-[var(--primary)] hover:text-white"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition-all hover:bg-[var(--primary)] hover:text-white"
                aria-label="GitHub"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[var(--surface-soft)] p-2 text-[var(--muted)] transition-all hover:bg-[var(--primary)] hover:text-white"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {t.categories}
            </h3>
            <ul className="mt-4 space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}&lang=${locale}`}
                    className="inline-block text-sm text-[var(--muted)] transition hover:text-[var(--primary)] hover:translate-x-1"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {t.support}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/warranty?lang=${locale}`}
                  className="inline-block text-sm text-[var(--muted)] transition hover:text-[var(--primary)] hover:translate-x-1"
                >
                  {t.warrantyPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/account?lang=${locale}`}
                  className="inline-block text-sm text-[var(--muted)] transition hover:text-[var(--primary)] hover:translate-x-1"
                >
                  {t.orderLookup}
                </Link>
              </li>
              <li>
                <Link
                  href={`/news?lang=${locale}`}
                  className="inline-block text-sm text-[var(--muted)] transition hover:text-[var(--primary)] hover:translate-x-1"
                >
                  {t.shippingPolicy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/warranty?lang=${locale}#steps`}
                  className="inline-block text-sm text-[var(--muted)] transition hover:text-[var(--primary)] hover:translate-x-1"
                >
                  {t.returnPolicy}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]">
              {t.contact}
            </h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-[var(--muted)]">
                <MapPin className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                <span>{t.address}</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                <Phone className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                <a href="tel:0961315200" className="hover:text-[var(--primary)]">
                  {t.phone}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-[var(--muted)]">
                <Mail className="h-5 w-5 shrink-0 text-[var(--primary)]" />
                <a
                  href="mailto:tanquoc7324@gmail.com"
                  className="hover:text-[var(--primary)]"
                >
                  {t.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-[var(--border)] pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            {t.copyright}
          </p>
          <div className="flex gap-6 text-xs text-[var(--muted)]">
            <Link href={`/news?lang=${locale}`} className="hover:text-[var(--primary)]">
              Blog
            </Link>
            <Link href={`/warranty?lang=${locale}`} className="hover:text-[var(--primary)]">
              FAQs
            </Link>
            <Link href={`/categories?lang=${locale}`} className="hover:text-[var(--primary)]">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
