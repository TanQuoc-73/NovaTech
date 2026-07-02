"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Tags,
  Trash2,
  Warehouse,
  X,
} from "lucide-react";

import {
  createAdminBrand,
  createAdminCategory,
  createAdminProduct,
  createAdminProductVariant,
  createAdminProductVariantImage,
  deleteAdminBrand,
  deleteAdminCategory,
  deleteAdminProduct,
  deleteAdminProductVariant,
  deleteAdminProductVariantImage,
  getAdminDashboard,
  updateAdminCategory,
  updateAdminProduct,
  updateAdminProductVariant,
  updateAdminProductVariantImage,
  type AdminDashboard,
  type AdminProduct,
  type AdminProductVariant,
  uploadAdminProductImage,
} from "@/features/admin/api/admin-api";
import { formatCurrency } from "@/shared/lib/format-currency";

type AdminTab = "products" | "categories" | "brands";

const tabs: Array<{ id: AdminTab; label: string }> = [
  { id: "products", label: "San pham" },
  { id: "categories", label: "Danh muc" },
  { id: "brands", label: "Thuong hieu" },
];

export function AdminDashboard({ initialTab = "products" }: { initialTab?: AdminTab }) {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboard)
      .catch(() => setMessage("Khong the tai du lieu admin."))
      .finally(() => setIsLoading(false));
  }, []);

  async function runAction(action: () => Promise<AdminDashboard>) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      setDashboard(await action());
    } catch {
      setMessage("Thao tac khong thanh cong. Kiem tra du lieu va quyen admin.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <section className="grid min-h-[360px] place-items-center text-stone-700">
        <p className="text-sm font-semibold">Dang tai admin dashboard...</p>
      </section>
    );
  }

  if (!dashboard) {
    return (
      <section className="grid min-h-[360px] place-items-center text-stone-700">
        <p className="text-sm font-semibold">{message}</p>
      </section>
    );
  }

  return (
    <section>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
              Catalog
            </p>
            <h1 className="mt-3 text-3xl font-semibold">Quan ly san pham</h1>
          </div>
        </div>

        {message ? (
          <div className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {message}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-5">
          <MetricCard
            icon={<Package className="h-5 w-5" />}
            label="Tong san pham"
            value={dashboard.metrics.products}
          />
          <MetricCard
            icon={<Package className="h-5 w-5" />}
            label="Dang ban"
            value={dashboard.metrics.activeProducts}
          />
          <MetricCard
            icon={<Warehouse className="h-5 w-5" />}
            label="Sap het hang"
            value={dashboard.metrics.lowStockVariants}
          />
          <MetricCard
            icon={<Tags className="h-5 w-5" />}
            label="Danh muc"
            value={dashboard.metrics.categories}
          />
          <MetricCard
            icon={<Tags className="h-5 w-5" />}
            label="Thuong hieu"
            value={dashboard.metrics.brands}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-2 border-b border-amber-900/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-11 rounded-t-md px-4 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-white text-amber-900"
                  : "text-stone-600 hover:bg-white/60 hover:text-stone-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "products" ? (
            <ProductsPanel
              dashboard={dashboard}
              isSubmitting={isSubmitting}
              runAction={runAction}
            />
          ) : null}
          {activeTab === "categories" ? (
            <CategoriesPanel
              dashboard={dashboard}
              isSubmitting={isSubmitting}
              runAction={runAction}
            />
          ) : null}
          {activeTab === "brands" ? (
            <BrandsPanel
              dashboard={dashboard}
              isSubmitting={isSubmitting}
              runAction={runAction}
            />
          ) : null}
        </div>
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-stone-500">{label}</p>
        <span className="text-amber-800">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </article>
  );
}

function getAdminProductImageUrl(product: AdminProduct) {
  return (
    product.variants?.find((variant) => variant.images?.[0]?.imageUrl)?.images[0]
      ?.imageUrl ??
    product.thumbnailUrl ??
    null
  );
}

function AdminProductImagePreview({
  product,
  sizeClassName,
}: {
  product: AdminProduct;
  sizeClassName: string;
}) {
  const imageUrl = getAdminProductImageUrl(product);

  return (
    <div
      className={`grid shrink-0 place-items-center overflow-hidden rounded-md bg-amber-100 text-xs font-bold text-amber-900 ${sizeClassName}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      ) : (
        product.name.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

function createPageNumbers(currentPage: number, totalPages: number) {
  const visiblePages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      visiblePages.add(page);
    }
  }

  return Array.from(visiblePages).sort((left, right) => left - right);
}

function ProductsPanel({
  dashboard,
  isSubmitting,
  runAction,
}: {
  dashboard: AdminDashboard;
  isSubmitting: boolean;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const selectedProduct = useMemo(
    () =>
      dashboard.products.find((product) => product.id === selectedProductId) ??
      null,
    [dashboard.products, selectedProductId],
  );
  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase();

    return dashboard.products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        product.slug.toLowerCase().includes(normalizedSearch) ||
        product.brand.toLowerCase().includes(normalizedSearch) ||
        product.category.toLowerCase().includes(normalizedSearch) ||
        product.variants.some((variant) =>
          `${variant.name} ${variant.sku}`.toLowerCase().includes(normalizedSearch),
        );
      const matchesBrand = !brandFilter || product.brandId === brandFilter;
      const matchesCategory =
        !categoryFilter || product.categoryId === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && product.isActive) ||
        (statusFilter === "hidden" && !product.isActive) ||
        (statusFilter === "featured" && product.isFeatured);
      const matchesStock =
        stockFilter === "all" ||
        (stockFilter === "in_stock" && product.stock > 0) ||
        (stockFilter === "low_stock" && product.stock > 0 && product.stock <= 5) ||
        (stockFilter === "out_stock" && product.stock <= 0);

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory &&
        matchesStatus &&
        matchesStock
      );
    });
  }, [
    brandFilter,
    categoryFilter,
    dashboard.products,
    productSearch,
    statusFilter,
    stockFilter,
  ]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (safeCurrentPage - 1) * productsPerPage,
    safeCurrentPage * productsPerPage,
  );
  const pageNumbers = createPageNumbers(safeCurrentPage, totalPages);
  const resultStart =
    filteredProducts.length === 0
      ? 0
      : (safeCurrentPage - 1) * productsPerPage + 1;
  const resultEnd = Math.min(safeCurrentPage * productsPerPage, filteredProducts.length);

  function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    void runAction(() =>
      createAdminProduct({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        categoryId: String(formData.get("categoryId") ?? ""),
        brandId: String(formData.get("brandId") ?? ""),
        variantName: String(formData.get("variantName") ?? ""),
        sku: String(formData.get("sku") ?? ""),
        price: Number(formData.get("price") ?? 0),
        stockQuantity: Number(formData.get("stockQuantity") ?? 0),
        isActive: true,
        isFeatured: false,
      }),
    ).then(() => form.reset());
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <form
        onSubmit={handleCreateProduct}
        className="h-fit rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm"
      >
        <PanelTitle title="Them san pham" />
        <AdminInput name="name" label="Ten san pham" required />
        <AdminInput name="slug" label="Slug" required />
        <AdminSelect name="categoryId" label="Danh muc" required>
          <option value="">Chon danh muc</option>
          {dashboard.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </AdminSelect>
        <AdminSelect name="brandId" label="Thuong hieu" required>
          <option value="">Chon thuong hieu</option>
          {dashboard.brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {brand.name}
            </option>
          ))}
        </AdminSelect>
        <AdminInput name="variantName" label="Ten variant" required />
        <AdminInput name="sku" label="SKU" required />
        <AdminInput name="price" label="Gia" type="number" required />
        <AdminInput name="stockQuantity" label="Ton kho" type="number" required />
        <SubmitButton disabled={isSubmitting}>Them san pham</SubmitButton>
      </form>

      <div className="overflow-hidden rounded-lg border border-amber-900/10 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-amber-900/10 bg-amber-50/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-950">
              <SlidersHorizontal className="h-4 w-4 text-amber-800" aria-hidden="true" />
              Bo loc san pham
            </div>
            <p className="text-xs font-semibold text-stone-500">
              {resultStart}-{resultEnd} / {filteredProducts.length} san pham
            </p>
          </div>

          <div className="grid gap-2 md:grid-cols-[minmax(180px,1.4fr)_repeat(4,minmax(130px,1fr))]">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
                aria-hidden="true"
              />
              <input
                value={productSearch}
                onChange={(event) => {
                  setProductSearch(event.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Tim ten, slug, SKU..."
                className="h-10 w-full rounded-md border border-amber-900/15 bg-white pl-9 pr-3 text-sm font-semibold text-stone-800 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              />
            </label>

            <select
              value={brandFilter}
              onChange={(event) => {
                setBrandFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Loc thuong hieu"
              className="h-10 rounded-md border border-amber-900/15 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            >
              <option value="">Tat ca thuong hieu</option>
              {dashboard.brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={(event) => {
                setCategoryFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Loc danh muc"
              className="h-10 rounded-md border border-amber-900/15 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            >
              <option value="">Tat ca danh muc</option>
              {dashboard.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Loc trang thai"
              className="h-10 rounded-md border border-amber-900/15 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            >
              <option value="all">Tat ca trang thai</option>
              <option value="active">Dang ban</option>
              <option value="hidden">Dang an</option>
              <option value="featured">Noi bat</option>
            </select>

            <select
              value={stockFilter}
              onChange={(event) => {
                setStockFilter(event.target.value);
                setCurrentPage(1);
              }}
              aria-label="Loc ton kho"
              className="h-10 rounded-md border border-amber-900/15 bg-white px-3 text-sm font-semibold text-stone-800 outline-none transition focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            >
              <option value="all">Tat ca ton kho</option>
              <option value="in_stock">Con hang</option>
              <option value="low_stock">Sap het hang</option>
              <option value="out_stock">Het hang</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-[64px_1fr_120px_100px_120px_120px] border-b border-amber-900/10 px-4 py-3 text-xs font-semibold uppercase text-stone-500">
          <span>Anh</span>
          <span>San pham</span>
          <span>Gia</span>
          <span>Ton</span>
          <span>Trang thai</span>
          <span></span>
        </div>
        {paginatedProducts.length ? (
          paginatedProducts.map((product) => (
            <div
              key={product.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedProductId(product.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setSelectedProductId(product.id);
                }
              }}
              className="grid cursor-pointer grid-cols-[64px_1fr_120px_100px_120px_120px] items-center gap-3 border-b border-amber-900/10 px-4 py-3 text-sm transition last:border-b-0 hover:bg-amber-50/60"
            >
              <AdminProductImagePreview product={product} sizeClassName="h-12 w-12" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-stone-950">{product.name}</p>
                <p className="mt-1 truncate text-xs font-semibold text-stone-500">
                  {product.brand} / {product.category}
                </p>
              </div>
              <span className="font-semibold">{formatCurrency(product.price)}</span>
              <span>{product.stock}</span>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={(event) => {
                  event.stopPropagation();

                  void runAction(() =>
                    updateAdminProduct(product.id, {
                      isActive: !product.isActive,
                    }),
                  );
                }}
                className={`h-9 rounded-md px-3 text-xs font-semibold ${
                  product.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {product.isActive ? "Dang ban" : "An"}
              </button>
              <IconDeleteButton
                disabled={isSubmitting}
                onClick={() => void runAction(() => deleteAdminProduct(product.id))}
              />
            </div>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-sm font-semibold text-stone-500">
            Khong co san pham nao khop voi bo loc.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/10 bg-[#fffdf7] px-4 py-3">
          <p className="text-xs font-semibold text-stone-500">
            Trang {safeCurrentPage} / {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              disabled={safeCurrentPage <= 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="grid h-9 w-9 place-items-center rounded-md border border-amber-900/15 text-stone-700 transition hover:border-amber-700 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang truoc"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-9 min-w-9 rounded-md px-3 text-sm font-semibold transition ${
                  page === safeCurrentPage
                    ? "bg-amber-700 text-white"
                    : "border border-amber-900/15 text-stone-700 hover:border-amber-700 hover:text-amber-800"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              disabled={safeCurrentPage >= totalPages}
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              className="grid h-9 w-9 place-items-center rounded-md border border-amber-900/15 text-stone-700 transition hover:border-amber-700 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {selectedProduct ? (
        <ProductDetailModal
          dashboard={dashboard}
          product={selectedProduct}
          isSubmitting={isSubmitting}
          onClose={() => setSelectedProductId(null)}
          runAction={runAction}
        />
      ) : null}
    </div>
  );
}

function ProductDetailModal({
  dashboard,
  product,
  isSubmitting,
  onClose,
  runAction,
}: {
  dashboard: AdminDashboard;
  product: AdminProduct;
  isSubmitting: boolean;
  onClose: () => void;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  const productVariants = product.variants ?? [];
  const previewImageUrl = getAdminProductImageUrl(product);

  function handleUpdateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void runAction(() =>
      updateAdminProduct(product.id, {
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        categoryId: String(formData.get("categoryId") ?? ""),
        brandId: String(formData.get("brandId") ?? ""),
        shortDescription: String(formData.get("shortDescription") ?? ""),
        description: String(formData.get("description") ?? ""),
        thumbnailUrl: String(formData.get("thumbnailUrl") ?? ""),
        isActive: formData.has("isActive"),
        isFeatured: formData.has("isFeatured"),
      }),
    );
  }

  function handleCreateVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    void runAction(() =>
      createAdminProductVariant(product.id, {
        ...readVariantPayload(formData),
        isActive: true,
      }),
    ).then(() => form.reset());
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/55 px-4 py-6">
      <section className="flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-[#fffdf7] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-amber-900/10 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-amber-800">
              Chi tiet san pham
            </p>
            <h2 className="mt-1 truncate text-xl font-semibold">{product.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-amber-900/15 text-stone-700 transition hover:bg-white"
            aria-label="Dong"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto p-5 lg:grid-cols-[360px_1fr]">
          <form
            onSubmit={handleUpdateProduct}
            className="h-fit rounded-lg border border-amber-900/10 bg-white p-4"
          >
            <PanelTitle title="Sua thong tin" />
            <div className="mb-4 overflow-hidden rounded-lg border border-amber-900/10 bg-amber-50">
              <div className="grid aspect-[16/10] place-items-center">
                {previewImageUrl ? (
                  <img
                    src={previewImageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold text-stone-500">
                    Chua co anh san pham
                  </span>
                )}
              </div>
            </div>
            <AdminInput
              name="name"
              label="Ten san pham"
              defaultValue={product.name}
              required
            />
            <AdminInput
              name="slug"
              label="Slug"
              defaultValue={product.slug}
              required
            />
            <AdminSelect
              name="categoryId"
              label="Danh muc"
              defaultValue={product.categoryId ?? ""}
              required
            >
              <option value="">Chon danh muc</option>
              {dashboard.categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </AdminSelect>
            <AdminSelect
              name="brandId"
              label="Thuong hieu"
              defaultValue={product.brandId ?? ""}
              required
            >
              <option value="">Chon thuong hieu</option>
              {dashboard.brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </AdminSelect>
            <AdminImageInput
              name="thumbnailUrl"
              label="Anh dai dien"
              defaultValue={product.thumbnailUrl ?? ""}
            />
            <AdminInput
              name="shortDescription"
              label="Mo ta ngan"
              defaultValue={product.shortDescription ?? ""}
            />
            <AdminTextarea
              name="description"
              label="Mo ta chi tiet"
              defaultValue={product.description ?? ""}
            />
            <div className="mb-3 grid gap-2 rounded-md bg-amber-50 p-3">
              <AdminCheckbox
                name="isActive"
                label="Dang ban"
                defaultChecked={product.isActive}
              />
              <AdminCheckbox
                name="isFeatured"
                label="Noi bat"
                defaultChecked={product.isFeatured}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <SubmitButton disabled={isSubmitting}>Luu san pham</SubmitButton>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() =>
                  void runAction(() => deleteAdminProduct(product.id)).then(onClose)
                }
                className="mt-2 inline-flex h-10 items-center rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Xoa san pham
              </button>
            </div>
          </form>

          <div className="space-y-4">
            <form
              onSubmit={handleCreateVariant}
              className="rounded-lg border border-amber-900/10 bg-white p-4"
            >
              <PanelTitle title="Them variant" />
              <div className="grid gap-x-3 md:grid-cols-2">
                <AdminInput name="name" label="Ten variant" required />
                <AdminInput name="sku" label="SKU" required />
                <AdminInput name="color" label="Mau" />
                <AdminInput name="storage" label="Luu tru" />
                <AdminInput name="ram" label="RAM" />
                <AdminInput name="price" label="Gia" type="number" required />
                <AdminInput name="compareAtPrice" label="Gia niem yet" type="number" />
                <AdminInput name="stockQuantity" label="Ton kho" type="number" />
                <AdminInput name="lowStockThreshold" label="Canh bao ton" type="number" />
                <AdminInput name="weightGrams" label="Khoi luong gram" type="number" />
              </div>
              <SubmitButton disabled={isSubmitting}>Them variant</SubmitButton>
            </form>

            <div className="space-y-3">
              {productVariants.map((variant) => (
                <VariantEditor
                  key={variant.id}
                  productId={product.id}
                  variant={variant}
                  isSubmitting={isSubmitting}
                  runAction={runAction}
                />
              ))}
              {!productVariants.length ? (
                <div className="rounded-lg border border-dashed border-amber-900/15 bg-white p-5 text-sm font-semibold text-stone-500">
                  San pham chua co variant.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function VariantEditor({
  productId,
  variant,
  isSubmitting,
  runAction,
}: {
  productId: string;
  variant: AdminProductVariant;
  isSubmitting: boolean;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void runAction(() =>
      updateAdminProductVariant(productId, variant.id, readVariantPayload(formData)),
    );
  }

  function handleCreateImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    void runAction(() =>
      createAdminProductVariantImage(
        productId,
        variant.id,
        readVariantImagePayload(formData),
      ),
    ).then(() => form.reset());
  }

  return (
    <article className="rounded-lg border border-amber-900/10 bg-white p-4">
      <form onSubmit={handleUpdate}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-semibold">{variant.name}</p>
            <p className="mt-1 truncate text-xs font-semibold text-stone-500">
              {variant.sku} / {formatCurrency(variant.price)}
            </p>
          </div>
          <AdminCheckbox
            name="isActive"
            label="Hien"
            defaultChecked={variant.isActive}
          />
        </div>

        <div className="grid gap-x-3 md:grid-cols-2">
          <AdminInput name="name" label="Ten variant" defaultValue={variant.name} required />
          <AdminInput name="sku" label="SKU" defaultValue={variant.sku} required />
          <AdminInput name="color" label="Mau" defaultValue={variant.color ?? ""} />
          <AdminInput
            name="storage"
            label="Luu tru"
            defaultValue={variant.storage ?? ""}
          />
          <AdminInput name="ram" label="RAM" defaultValue={variant.ram ?? ""} />
          <AdminInput
            name="price"
            label="Gia"
            type="number"
            defaultValue={String(variant.price)}
            required
          />
          <AdminInput
            name="compareAtPrice"
            label="Gia niem yet"
            type="number"
            defaultValue={variant.compareAtPrice ? String(variant.compareAtPrice) : ""}
          />
          <AdminInput
            name="stockQuantity"
            label="Ton kho"
            type="number"
            defaultValue={String(variant.stockQuantity)}
          />
          <AdminInput
            name="lowStockThreshold"
            label="Canh bao ton"
            type="number"
            defaultValue={String(variant.lowStockThreshold)}
          />
          <AdminInput
            name="weightGrams"
            label="Khoi luong gram"
            type="number"
            defaultValue={variant.weightGrams ? String(variant.weightGrams) : ""}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <SubmitButton disabled={isSubmitting}>Luu variant</SubmitButton>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() =>
              void runAction(() => deleteAdminProductVariant(productId, variant.id))
            }
            className="mt-2 inline-flex h-10 items-center rounded-md border border-red-200 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Xoa variant
          </button>
        </div>
      </form>

      <div className="mt-4 border-t border-amber-900/10 pt-4">
        <p className="mb-3 text-sm font-semibold text-stone-950">Anh variant</p>
        <form
          onSubmit={handleCreateImage}
          className="grid gap-3 rounded-md bg-amber-50 p-3 md:grid-cols-[1fr_1fr_96px_auto]"
        >
          <AdminImageInput name="imageUrl" label="URL anh" required />
          <AdminInput name="altText" label="Alt text" />
          <AdminInput name="sortOrder" label="Thu tu" type="number" />
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-5 h-10 rounded-md bg-amber-700 px-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Them
          </button>
        </form>

        <div className="mt-3 grid gap-3">
          {(variant.images ?? []).map((image) => (
            <VariantImageEditor
              key={image.id}
              productId={productId}
              variantId={variant.id}
              image={image}
              isSubmitting={isSubmitting}
              runAction={runAction}
            />
          ))}
          {!(variant.images ?? []).length ? (
            <p className="rounded-md border border-dashed border-amber-900/15 p-3 text-sm font-semibold text-stone-500">
              Chua co anh rieng cho variant nay.
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function VariantImageEditor({
  productId,
  variantId,
  image,
  isSubmitting,
  runAction,
}: {
  productId: string;
  variantId: string;
  image: AdminProductVariant["images"][number];
  isSubmitting: boolean;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void runAction(() =>
      updateAdminProductVariantImage(
        productId,
        variantId,
        image.id,
        readVariantImagePayload(formData),
      ),
    );
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="grid gap-3 rounded-md border border-amber-900/10 p-3 md:grid-cols-[80px_1fr_1fr_84px_auto_auto]"
    >
      <div className="h-16 overflow-hidden rounded-md bg-stone-100">
        <img
          src={image.imageUrl}
          alt={image.altText ?? ""}
          className="h-full w-full object-cover"
        />
      </div>
      <AdminImageInput
        name="imageUrl"
        label="URL anh"
        defaultValue={image.imageUrl}
        required
      />
      <AdminInput
        name="altText"
        label="Alt text"
        defaultValue={image.altText ?? ""}
      />
      <AdminInput
        name="sortOrder"
        label="Thu tu"
        type="number"
        defaultValue={String(image.sortOrder)}
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 h-10 rounded-md bg-amber-700 px-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        Luu
      </button>
      <button
        type="button"
        disabled={isSubmitting}
        onClick={() =>
          void runAction(() =>
            deleteAdminProductVariantImage(productId, variantId, image.id),
          )
        }
        className="mt-5 h-10 rounded-md border border-red-200 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Xoa
      </button>
    </form>
  );
}

function readVariantPayload(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    color: String(formData.get("color") ?? ""),
    storage: String(formData.get("storage") ?? ""),
    ram: String(formData.get("ram") ?? ""),
    price: Number(formData.get("price") ?? 0),
    compareAtPrice: String(formData.get("compareAtPrice") ?? ""),
    stockQuantity: Number(formData.get("stockQuantity") ?? 0),
    lowStockThreshold: Number(formData.get("lowStockThreshold") ?? 5),
    weightGrams: String(formData.get("weightGrams") ?? ""),
    isActive: formData.has("isActive"),
  };
}

function readVariantImagePayload(formData: FormData) {
  return {
    imageUrl: String(formData.get("imageUrl") ?? ""),
    altText: String(formData.get("altText") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };
}

function CategoriesPanel({
  dashboard,
  isSubmitting,
  runAction,
}: {
  dashboard: AdminDashboard;
  isSubmitting: boolean;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    void runAction(() =>
      createAdminCategory({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        sortOrder: Number(formData.get("sortOrder") ?? 0),
        isActive: true,
      }),
    ).then(() => form.reset());
  }

  return (
    <CrudPanel
      title="Them danh muc"
      onCreate={handleCreate}
      isSubmitting={isSubmitting}
      fields={<AdminInput name="sortOrder" label="Thu tu" type="number" />}
      rows={dashboard.categories.map((category) => ({
        id: category.id,
        title: category.name,
        subtitle: category.slug,
        meta: category.isActive ? "Dang hien" : "Dang an",
        onToggle: () =>
          runAction(() =>
            updateAdminCategory(category.id, { isActive: !category.isActive }),
          ),
        onDelete: () => runAction(() => deleteAdminCategory(category.id)),
      }))}
    />
  );
}

function BrandsPanel({
  dashboard,
  isSubmitting,
  runAction,
}: {
  dashboard: AdminDashboard;
  isSubmitting: boolean;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    void runAction(() =>
      createAdminBrand({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
      }),
    ).then(() => form.reset());
  }

  return (
    <CrudPanel
      title="Them thuong hieu"
      onCreate={handleCreate}
      isSubmitting={isSubmitting}
      rows={dashboard.brands.map((brand) => ({
        id: brand.id,
        title: brand.name,
        subtitle: brand.slug,
        meta: "Brand",
        onDelete: () => runAction(() => deleteAdminBrand(brand.id)),
      }))}
    />
  );
}

function CrudPanel({
  title,
  onCreate,
  isSubmitting,
  fields,
  rows,
}: {
  title: string;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
  fields?: ReactNode;
  rows: Array<{
    id: string;
    title: string;
    subtitle: string;
    meta: string;
    onToggle?: () => void;
    onDelete: () => void;
  }>;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={onCreate}
        className="h-fit rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm"
      >
        <PanelTitle title={title} />
        <AdminInput name="name" label="Ten" required />
        <AdminInput name="slug" label="Slug" required />
        {fields}
        <SubmitButton disabled={isSubmitting}>Them</SubmitButton>
      </form>

      <div className="overflow-hidden rounded-lg border border-amber-900/10 bg-white shadow-sm">
        {rows.map((row) => (
          <div
            key={row.id}
            className="grid grid-cols-[1fr_120px_44px] items-center gap-3 border-b border-amber-900/10 px-4 py-3 text-sm last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-stone-950">{row.title}</p>
              <p className="mt-1 truncate text-xs font-semibold text-stone-500">
                {row.subtitle}
              </p>
            </div>
            <button
              type="button"
              disabled={isSubmitting || !row.onToggle}
              onClick={row.onToggle}
              className="h-9 rounded-md bg-stone-100 px-3 text-xs font-semibold text-stone-600 transition hover:bg-amber-50 hover:text-amber-800 disabled:cursor-default disabled:hover:bg-stone-100 disabled:hover:text-stone-600"
            >
              {row.meta}
            </button>
            <IconDeleteButton disabled={isSubmitting} onClick={row.onDelete} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelTitle({ title }: { title: string }) {
  return <h2 className="mb-4 text-base font-semibold text-stone-950">{title}</h2>;
}

function AdminInput({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 h-10 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      />
    </label>
  );
}

function AdminTextarea({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <label className="mb-3 block">
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={4}
        className="mt-1 w-full rounded-md border border-amber-900/15 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      />
    </label>
  );
}

function AdminImageInput({
  label,
  name,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const fileInput = event.currentTarget;
    const file = fileInput.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("Chi chon file anh.");
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const result = await uploadAdminProductImage(file);

      if (inputRef.current) {
        inputRef.current.value = result.publicUrl;
      }

      setMessage("Da upload anh.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Khong the upload anh.");
    } finally {
      setIsUploading(false);
      fileInput.value = "";
    }
  }

  return (
    <label className="mb-3 block">
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      <div className="mt-1 flex gap-2">
        <input
          ref={inputRef}
          name={name}
          required={required}
          defaultValue={defaultValue}
          className="h-10 min-w-0 flex-1 rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
        />
        <span className="relative inline-flex h-10 shrink-0 items-center rounded-md border border-amber-900/15 px-3 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800">
          {isUploading ? "Dang tai..." : "Chon anh"}
          <input
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={handleFileChange}
            className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
          />
        </span>
      </div>
      {message ? (
        <span className="mt-1 block text-xs font-semibold text-stone-500">
          {message}
        </span>
      ) : null}
    </label>
  );
}

function AdminCheckbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-amber-700"
      />
      {label}
    </label>
  );
}

function AdminSelect({
  label,
  name,
  required,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  children: ReactNode;
}) {
  return (
    <label className="mb-3 block">
      <span className="text-xs font-semibold text-stone-600">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 h-10 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      >
        {children}
      </select>
    </label>
  );
}

function SubmitButton({
  disabled,
  children,
}: {
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="mt-2 inline-flex h-10 items-center gap-2 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Plus className="h-4 w-4" aria-hidden="true" />
      {children}
    </button>
  );
}

function IconDeleteButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="grid h-10 w-10 place-items-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
