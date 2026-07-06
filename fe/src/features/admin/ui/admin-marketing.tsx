"use client";

import { useEffect, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { ImagePlus, Newspaper, TicketPercent, Trash2 } from "lucide-react";

import {
  createAdminHeroBanner,
  createAdminNewsArticle,
  createAdminVoucher,
  deleteAdminHeroBanner,
  deleteAdminNewsArticle,
  deleteAdminVoucher,
  getAdminDashboard,
  type AdminDashboard,
} from "@/features/admin/api/admin-api";
import { formatCurrency } from "@/shared/lib/format-currency";
import { PageSkeleton } from "@/shared/ui/loading-skeleton";

export function AdminMarketing() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboard)
      .catch((error) =>
        setMessage(error instanceof Error ? error.message : "Khong the tai du lieu."),
      );
  }, []);

  async function runAction(action: () => Promise<AdminDashboard>) {
    setMessage(null);

    try {
      setDashboard(await action());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Thao tac that bai.");
    }
  }

  if (!dashboard) {
    return <PageSkeleton />;
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-semibold text-cyan-700">Marketing</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-950">
          Banner, tin tức và voucher
        </h1>
      </div>

      {message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <MarketingPanel icon={ImagePlus} title="Hero banner">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              void runAction(() =>
                createAdminHeroBanner({
                  title: formData.get("title"),
                  subtitle: formData.get("subtitle"),
                  label: formData.get("label"),
                  tag: formData.get("tag"),
                  imageUrl: formData.get("imageUrl"),
                  href: formData.get("href"),
                  priceText: formData.get("priceText"),
                  highlight: formData.get("highlight"),
                  sortOrder: Number(formData.get("sortOrder") ?? 0),
                  isActive: true,
                }),
              );
              event.currentTarget.reset();
            }}
          >
            <AdminInput name="title" placeholder="Tieu de banner" required />
            <AdminInput name="subtitle" placeholder="Mo ta ngan" />
            <div className="grid grid-cols-2 gap-2">
              <AdminInput name="label" placeholder="Label" />
              <AdminInput name="tag" placeholder="Tag" />
            </div>
            <AdminInput name="imageUrl" placeholder="URL anh banner" />
            <AdminInput name="href" placeholder="/news hoac /products" />
            <div className="grid grid-cols-2 gap-2">
              <AdminInput name="priceText" placeholder="Gia/CTA" />
              <AdminInput name="sortOrder" placeholder="Thu tu" type="number" />
            </div>
            <AdminInput name="highlight" placeholder="Diem noi bat" />
            <AdminSubmit>Thêm banner</AdminSubmit>
          </form>

          <AdminList>
            {dashboard.heroBanners.map((banner) => (
              <AdminListItem
                key={banner.id}
                title={banner.title}
                meta={banner.isActive ? "Dang hien thi" : "Dang tat"}
                onDelete={() => runAction(() => deleteAdminHeroBanner(banner.id))}
              />
            ))}
          </AdminList>
        </MarketingPanel>

        <MarketingPanel icon={Newspaper} title="Tin tức">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              void runAction(() =>
                createAdminNewsArticle({
                  title: formData.get("title"),
                  slug: formData.get("slug"),
                  excerpt: formData.get("excerpt"),
                  content: formData.get("content"),
                  category: formData.get("category"),
                  imageUrl: formData.get("imageUrl"),
                  href: formData.get("href"),
                  isPublished: true,
                }),
              );
              event.currentTarget.reset();
            }}
          >
            <AdminInput name="title" placeholder="Tieu de bai viet" required />
            <AdminInput name="slug" placeholder="slug-bai-viet" required />
            <AdminInput name="category" placeholder="Danh muc" />
            <AdminInput name="imageUrl" placeholder="URL anh tin tuc" />
            <AdminInput name="href" placeholder="/products?category=laptop" />
            <AdminTextarea name="excerpt" placeholder="Tom tat" />
            <AdminTextarea name="content" placeholder="Noi dung ngan" />
            <AdminSubmit>Thêm tin</AdminSubmit>
          </form>

          <AdminList>
            {dashboard.newsArticles.map((article) => (
              <AdminListItem
                key={article.id}
                title={article.title}
                meta={article.isPublished ? "Da xuat ban" : "Ban nhap"}
                onDelete={() => runAction(() => deleteAdminNewsArticle(article.id))}
              />
            ))}
          </AdminList>
        </MarketingPanel>

        <MarketingPanel icon={TicketPercent} title="Voucher">
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);

              void runAction(() =>
                createAdminVoucher({
                  code: formData.get("code"),
                  title: formData.get("title"),
                  description: formData.get("description"),
                  discountType: formData.get("discountType"),
                  discountValue: Number(formData.get("discountValue") ?? 0),
                  minOrderAmount: Number(formData.get("minOrderAmount") ?? 0),
                  maxDiscountAmount:
                    formData.get("maxDiscountAmount") === ""
                      ? undefined
                      : Number(formData.get("maxDiscountAmount") ?? 0),
                  usageLimit:
                    formData.get("usageLimit") === ""
                      ? undefined
                      : Number(formData.get("usageLimit") ?? 0),
                  isActive: true,
                }),
              );
              event.currentTarget.reset();
            }}
          >
            <div className="grid grid-cols-2 gap-2">
              <AdminInput name="code" placeholder="TECHWEEK" required />
              <select
                name="discountType"
                className="h-10 rounded-md border border-cyan-950/10 px-3 text-sm font-semibold"
                defaultValue="percent"
              >
                <option value="percent">Phần trăm</option>
                <option value="fixed">Cố định</option>
              </select>
            </div>
            <AdminInput name="title" placeholder="Ten voucher" required />
            <AdminTextarea name="description" placeholder="Mo ta" />
            <div className="grid grid-cols-2 gap-2">
              <AdminInput name="discountValue" placeholder="Gia tri" type="number" required />
              <AdminInput name="minOrderAmount" placeholder="Don toi thieu" type="number" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AdminInput name="maxDiscountAmount" placeholder="Giam toi da" type="number" />
              <AdminInput name="usageLimit" placeholder="Gioi han luot" type="number" />
            </div>
            <AdminSubmit>Thêm voucher</AdminSubmit>
          </form>

          <AdminList>
            {dashboard.vouchers.map((voucher) => (
              <AdminListItem
                key={voucher.id}
                title={`${voucher.code} - ${voucher.title}`}
                meta={`${voucher.usedCount}/${voucher.usageLimit ?? "∞"} luot - ${
                  voucher.discountType === "percent"
                    ? `${voucher.discountValue}%`
                    : formatCurrency(voucher.discountValue)
                }`}
                onDelete={() => runAction(() => deleteAdminVoucher(voucher.id))}
              />
            ))}
          </AdminList>
        </MarketingPanel>
      </div>
    </section>
  );
}

function MarketingPanel({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ImagePlus;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-semibold">
        <Icon className="h-4 w-4 text-cyan-700" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-4 grid gap-5">{children}</div>
    </section>
  );
}

function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 rounded-md border border-cyan-950/10 px-3 text-sm font-semibold outline-none focus:border-cyan-600"
    />
  );
}

function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={3}
      className="rounded-md border border-cyan-950/10 px-3 py-2 text-sm font-semibold outline-none focus:border-cyan-600"
    />
  );
}

function AdminSubmit({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-10 rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
    >
      {children}
    </button>
  );
}

function AdminList({ children }: { children: ReactNode }) {
  return <div className="grid gap-2 border-t border-cyan-950/10 pt-4">{children}</div>;
}

function AdminListItem({
  title,
  meta,
  onDelete,
}: {
  title: string;
  meta: string;
  onDelete: () => void;
}) {
  return (
    <article className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
          {meta}
        </span>
      </span>
      <button
        type="button"
        onClick={onDelete}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-red-700 transition hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  );
}
