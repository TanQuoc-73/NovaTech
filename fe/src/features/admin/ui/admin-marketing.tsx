"use client";

import { useEffect, useRef, useState } from "react";
import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";
import { ImagePlus, Newspaper, Pencil, TicketPercent, Trash2, X } from "lucide-react";

import {
  createAdminHeroBanner,
  createAdminNewsArticle,
  createAdminVoucher,
  deleteAdminHeroBanner,
  deleteAdminNewsArticle,
  deleteAdminVoucher,
  getAdminDashboard,
  updateAdminHeroBanner,
  updateAdminNewsArticle,
  updateAdminVoucher,
  type AdminDashboard,
  type AdminHeroBanner,
  type AdminNewsArticle,
  type AdminVoucher,
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
      {message ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-5 xl:grid-cols-[repeat(3,minmax(0,1fr))]">
        <MarketingPanel icon={ImagePlus} title="Hero banner">
          <form
            className="grid min-w-0 gap-3"
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
            <AdminField label="Tiêu đề">
              <AdminInput name="title" required />
            </AdminField>
            <AdminField label="Mô tả">
              <AdminTextarea name="subtitle" rows={2} />
            </AdminField>
            <AdminField label="Ảnh">
              <AdminInput name="imageUrl" />
            </AdminField>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <AdminField label="Link">
                <AdminInput name="href" placeholder="/news" />
              </AdminField>
              <AdminField label="Thứ tự">
                <AdminInput name="sortOrder" type="number" />
              </AdminField>
            </div>
            <AdminSubmit>Thêm banner</AdminSubmit>
          </form>

          <AdminList>
            {dashboard.heroBanners.map((banner) => (
              <AdminEditableItem
                key={banner.id}
                title={banner.title}
                meta={banner.isActive ? "Dang hien thi" : "Dang tat"}
                onDelete={() => runAction(() => deleteAdminHeroBanner(banner.id))}
                onSave={(formData) =>
                  runAction(() =>
                    updateAdminHeroBanner(banner.id, {
                      title: formData.get("title"),
                      subtitle: formData.get("subtitle"),
                      label: formData.get("label"),
                      tag: formData.get("tag"),
                      imageUrl: formData.get("imageUrl"),
                      href: formData.get("href"),
                      priceText: formData.get("priceText"),
                      highlight: formData.get("highlight"),
                      sortOrder: Number(formData.get("sortOrder") ?? 0),
                      isActive: formData.get("isActive") === "on",
                    }),
                  )
                }
                editFields={
                  <div className="grid min-w-0 gap-2">
                    <AdminField label="Tiêu đề">
                      <AdminInput name="title" defaultValue={banner.title} required />
                    </AdminField>
                    <AdminField label="Mô tả">
                      <AdminTextarea name="subtitle" rows={2} defaultValue={banner.subtitle ?? ""} />
                    </AdminField>
                    <div className="grid min-w-0 grid-cols-2 gap-2">
                      <AdminField label="Link">
                        <AdminInput name="href" defaultValue={banner.href ?? ""} />
                      </AdminField>
                      <AdminField label="Thứ tự">
                        <AdminInput name="sortOrder" type="number" defaultValue={String(banner.sortOrder)} />
                      </AdminField>
                    </div>
                    <AdminField label="Ảnh URL">
                      <AdminInput name="imageUrl" defaultValue={banner.imageUrl ?? ""} />
                    </AdminField>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input name="isActive" type="checkbox" defaultChecked={banner.isActive} className="h-4 w-4 accent-cyan-500" />
                      Đang hiển thị
                    </label>
                  </div>
                }
              />
            ))}
          </AdminList>
        </MarketingPanel>

        <MarketingPanel icon={Newspaper} title="Tin tức">
          <form
            className="grid min-w-0 gap-3"
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
            <AdminField label="Tiêu đề">
              <AdminInput name="title" required />
            </AdminField>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <AdminField label="Slug">
                <AdminInput name="slug" required />
              </AdminField>
              <AdminField label="Danh mục">
                <AdminInput name="category" />
              </AdminField>
            </div>
            <AdminField label="Ảnh">
              <AdminInput name="imageUrl" />
            </AdminField>
            <AdminField label="Tóm tắt">
              <AdminTextarea name="excerpt" rows={2} />
            </AdminField>
            <AdminSubmit>Thêm tin</AdminSubmit>
          </form>

          <AdminList>
            {dashboard.newsArticles.map((article) => (
              <AdminEditableItem
                key={article.id}
                title={article.title}
                meta={article.isPublished ? "Da xuat ban" : "Ban nhap"}
                onDelete={() => runAction(() => deleteAdminNewsArticle(article.id))}
                onSave={(formData) =>
                  runAction(() =>
                    updateAdminNewsArticle(article.id, {
                      title: formData.get("title"),
                      slug: formData.get("slug"),
                      excerpt: formData.get("excerpt"),
                      content: formData.get("content"),
                      category: formData.get("category"),
                      imageUrl: formData.get("imageUrl"),
                      href: formData.get("href"),
                      isPublished: formData.get("isPublished") === "on",
                    }),
                  )
                }
                editFields={
                  <div className="grid min-w-0 gap-2">
                    <AdminField label="Tiêu đề">
                      <AdminInput name="title" defaultValue={article.title} required />
                    </AdminField>
                    <div className="grid min-w-0 grid-cols-2 gap-2">
                      <AdminField label="Slug">
                        <AdminInput name="slug" defaultValue={article.slug} required />
                      </AdminField>
                      <AdminField label="Danh mục">
                        <AdminInput name="category" defaultValue={article.category ?? ""} />
                      </AdminField>
                    </div>
                    <AdminField label="Ảnh URL">
                      <AdminInput name="imageUrl" defaultValue={article.imageUrl ?? ""} />
                    </AdminField>
                    <AdminField label="Tóm tắt">
                      <AdminTextarea name="excerpt" rows={2} defaultValue={article.excerpt ?? ""} />
                    </AdminField>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input name="isPublished" type="checkbox" defaultChecked={article.isPublished} className="h-4 w-4 accent-cyan-500" />
                      Đã xuất bản
                    </label>
                  </div>
                }
              />
            ))}
          </AdminList>
        </MarketingPanel>

        <MarketingPanel icon={TicketPercent} title="Voucher">
          <form
            className="grid min-w-0 gap-3"
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
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <AdminField label="Mã">
                <AdminInput name="code" required />
              </AdminField>
              <AdminField label="Loại">
                <select
                  name="discountType"
                  className="h-10 w-full min-w-0 rounded-md border border-cyan-950/10 px-3 text-sm font-semibold"
                  defaultValue="percent"
                >
                  <option value="percent">%</option>
                  <option value="fixed">VNĐ</option>
                </select>
              </AdminField>
            </div>
            <AdminField label="Tên">
              <AdminInput name="title" required />
            </AdminField>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <AdminField label="Giá trị">
                <AdminInput name="discountValue" type="number" required />
              </AdminField>
              <AdminField label="Đơn tối thiểu">
                <AdminInput name="minOrderAmount" type="number" />
              </AdminField>
            </div>
            <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
              <AdminField label="Giảm tối đa">
                <AdminInput name="maxDiscountAmount" type="number" />
              </AdminField>
              <AdminField label="Lượt dùng">
                <AdminInput name="usageLimit" type="number" />
              </AdminField>
            </div>
            <AdminSubmit>Thêm voucher</AdminSubmit>
          </form>

          <AdminList>
            {dashboard.vouchers.map((voucher) => (
              <AdminEditableItem
                key={voucher.id}
                title={`${voucher.code} - ${voucher.title}`}
                meta={`${voucher.usedCount}/${voucher.usageLimit ?? "∞"} luot - ${
                  voucher.discountType === "percent"
                    ? `${voucher.discountValue}%`
                    : formatCurrency(voucher.discountValue)
                }`}
                onDelete={() => runAction(() => deleteAdminVoucher(voucher.id))}
                onSave={(formData) =>
                  runAction(() =>
                    updateAdminVoucher(voucher.id, {
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
                      isActive: formData.get("isActive") === "on",
                    }),
                  )
                }
                editFields={
                  <div className="grid min-w-0 gap-2">
                    <div className="grid min-w-0 grid-cols-2 gap-2">
                      <AdminField label="Mã">
                        <AdminInput name="code" defaultValue={voucher.code} required />
                      </AdminField>
                      <AdminField label="Loại">
                        <select
                          name="discountType"
                          className="h-10 w-full min-w-0 rounded-md border border-cyan-950/10 px-3 text-sm font-semibold"
                          defaultValue={voucher.discountType}
                        >
                          <option value="percent">%</option>
                          <option value="fixed">VNĐ</option>
                        </select>
                      </AdminField>
                    </div>
                    <AdminField label="Tên">
                      <AdminInput name="title" defaultValue={voucher.title} required />
                    </AdminField>
                    <div className="grid min-w-0 grid-cols-2 gap-2">
                      <AdminField label="Giá trị">
                        <AdminInput name="discountValue" type="number" defaultValue={String(voucher.discountValue)} required />
                      </AdminField>
                      <AdminField label="Đơn tối thiểu">
                        <AdminInput name="minOrderAmount" type="number" defaultValue={String(voucher.minOrderAmount)} />
                      </AdminField>
                    </div>
                    <div className="grid min-w-0 grid-cols-2 gap-2">
                      <AdminField label="Giảm tối đa">
                        <AdminInput name="maxDiscountAmount" type="number" defaultValue={voucher.maxDiscountAmount != null ? String(voucher.maxDiscountAmount) : ""} />
                      </AdminField>
                      <AdminField label="Lượt dùng">
                        <AdminInput name="usageLimit" type="number" defaultValue={voucher.usageLimit != null ? String(voucher.usageLimit) : ""} />
                      </AdminField>
                    </div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input name="isActive" type="checkbox" defaultChecked={voucher.isActive} className="h-4 w-4 accent-cyan-500" />
                      Đang kích hoạt
                    </label>
                  </div>
                }
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
    <section className="min-w-0 overflow-hidden rounded-lg border border-cyan-950/10 bg-white p-4 shadow-sm">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Icon className="h-4 w-4 text-cyan-700" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-4 grid min-w-0 gap-4">{children}</div>
    </section>
  );
}

function AdminField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-semibold text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function AdminInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full min-w-0 rounded-md border border-cyan-950/10 px-3 text-sm font-semibold outline-none placeholder:text-slate-400 focus:border-cyan-600"
    />
  );
}

function AdminTextarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      rows={props.rows ?? 3}
      className="w-full min-w-0 rounded-md border border-cyan-950/10 px-3 py-2 text-sm font-semibold outline-none placeholder:text-slate-400 focus:border-cyan-600"
    />
  );
}

function AdminSubmit({ children }: { children: ReactNode }) {
  return (
    <button
      type="submit"
      className="h-10 w-full rounded-md bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
    >
      {children}
    </button>
  );
}

function AdminList({ children }: { children: ReactNode }) {
  return <div className="grid min-w-0 gap-2 border-t border-cyan-950/10 pt-4">{children}</div>;
}

function AdminEditableItem({
  title,
  meta,
  onDelete,
  onSave,
  editFields,
}: {
  title: string;
  meta: string;
  onDelete: () => void;
  onSave: (formData: FormData) => void;
  editFields: ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSave(new FormData(event.currentTarget));
          setEditing(false);
        }}
        className="rounded-md border border-cyan-950/10 bg-cyan-50/60 p-3"
      >
        {editFields}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="submit"
            className="inline-flex h-8 items-center rounded-md bg-cyan-500 px-3 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="inline-flex h-8 items-center rounded-md border border-cyan-950/10 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Hủy
          </button>
        </div>
      </form>
    );
  }

  return (
    <article className="flex min-w-0 items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2">
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
          {meta}
        </span>
      </span>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-cyan-50 hover:text-cyan-700"
          title="Chỉnh sửa"
        >
          <Pencil className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.confirm("Xác nhận xóa mục này?")) {
              onDelete();
            }
          }}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-red-700 transition hover:bg-red-50"
          title="Xóa"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}
