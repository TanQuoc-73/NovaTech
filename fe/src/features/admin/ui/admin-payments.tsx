"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { CreditCard, Trash2 } from "lucide-react";

import {
  createAdminPaymentQrSetting,
  deleteAdminPaymentQrSetting,
  getAdminDashboard,
  updateAdminPaymentQrSetting,
  uploadAdminPaymentQrImage,
  type AdminDashboard,
  type AdminPaymentQrSetting,
} from "@/features/admin/api/admin-api";
import { FormSkeleton } from "@/shared/ui/loading-skeleton";

const paymentProviders = [
  { value: "bank_transfer", label: "QR test / chuyển khoản" },
  { value: "momo", label: "MoMo test" },
  { value: "vnpay", label: "VNPAY test" },
];

export function AdminPayments() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [qrImageUrl, setQrImageUrl] = useState("");

  useEffect(() => {
    getAdminDashboard()
      .then(setDashboard)
      .catch(() => setMessage("Không thể tải cấu hình thanh toán."))
      .finally(() => setIsLoading(false));
  }, []);

  async function runAction(action: () => Promise<AdminDashboard>) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      setDashboard(await action());
      setMessage("Đã cập nhật cấu hình thanh toán.");
    } catch {
      setMessage("Thao tác không thành công. Kiểm tra lại dữ liệu QR.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);
    setMessage(null);

    try {
      const result = await uploadAdminPaymentQrImage(file);
      setQrImageUrl(result.publicUrl);
      setMessage("Đã upload ảnh QR.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không thể upload QR.");
    } finally {
      input.value = "";
      setIsUploading(false);
    }
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void runAction(() =>
      createAdminPaymentQrSetting({
        provider: String(formData.get("provider") ?? "bank_transfer"),
        title: String(formData.get("title") ?? ""),
        qrImageUrl,
        accountName: String(formData.get("accountName") ?? ""),
        accountNumber: String(formData.get("accountNumber") ?? ""),
        bankName: String(formData.get("bankName") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        isActive: formData.get("isActive") === "on",
        sortOrder: Number(formData.get("sortOrder") ?? 0),
      }),
    ).then(() => setQrImageUrl(""));
  }

  if (isLoading) {
    return <FormSkeleton />;
  }

  const settings = dashboard?.paymentQrSettings ?? [];

  return (
    <section>
      {message ? (
        <div className="mt-5 rounded-md bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-800">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleCreate}
          className="h-fit rounded-lg border border-cyan-950/10 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-cyan-700" aria-hidden="true" />
            <h2 className="font-semibold">Thêm QR test</h2>
          </div>

          <div className="mt-5 grid gap-4">
            <AdminPaymentField name="title" label="Tên QR" required />
            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-600">
                Loại thanh toán
              </span>
              <select
                name="provider"
                className="mt-2 h-11 w-full rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              >
                {paymentProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>
            <AdminPaymentField name="bankName" label="Ngân hàng/ví" />
            <AdminPaymentField name="accountName" label="Tên tài khoản" />
            <AdminPaymentField name="accountNumber" label="Số tài khoản" />
            <AdminPaymentField name="sortOrder" label="Thứ tự" type="number" />

            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-600">
                Ảnh QR
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="mt-2 block w-full text-sm font-semibold text-slate-600 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-cyan-500 file:px-3 file:text-sm file:font-semibold file:text-slate-950"
              />
            </label>

            {qrImageUrl ? (
              <div className="rounded-lg border border-cyan-950/10 bg-cyan-50 p-3">
                <img
                  src={qrImageUrl}
                  alt="QR preview"
                  className="mx-auto h-44 w-44 rounded-md object-contain"
                />
              </div>
            ) : null}

            <label className="block">
              <span className="text-xs font-semibold uppercase text-slate-600">
                Hướng dẫn
              </span>
              <textarea
                name="instructions"
                rows={3}
                className="mt-2 w-full rounded-md border border-cyan-950/15 px-3 py-2 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-cyan-500"
              />
              Đang bật
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading || !qrImageUrl}
            className="mt-5 h-11 w-full rounded-md bg-cyan-500 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Đang upload..." : "Lưu QR"}
          </button>
        </form>

        <div className="grid gap-4">
          {settings.length ? (
            settings.map((setting) => (
              <PaymentQrCard
                key={setting.id}
                setting={setting}
                disabled={isSubmitting}
                runAction={runAction}
              />
            ))
          ) : (
            <div className="rounded-lg border border-cyan-950/10 bg-white p-6 text-sm font-semibold text-slate-600">
              Chưa có QR test nào.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PaymentQrCard({
  setting,
  disabled,
  runAction,
}: {
  setting: AdminPaymentQrSetting;
  disabled: boolean;
  runAction: (action: () => Promise<AdminDashboard>) => Promise<void>;
}) {
  function handleUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    void runAction(() =>
      updateAdminPaymentQrSetting(setting.id, {
        provider: String(formData.get("provider") ?? setting.provider),
        title: String(formData.get("title") ?? ""),
        qrImageUrl: String(formData.get("qrImageUrl") ?? ""),
        accountName: String(formData.get("accountName") ?? ""),
        accountNumber: String(formData.get("accountNumber") ?? ""),
        bankName: String(formData.get("bankName") ?? ""),
        instructions: String(formData.get("instructions") ?? ""),
        isActive: formData.get("isActive") === "on",
        sortOrder: Number(formData.get("sortOrder") ?? 0),
      }),
    );
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="rounded-lg border border-cyan-950/10 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[160px_1fr_auto]">
        <div className="grid place-items-center rounded-lg bg-cyan-50 p-3">
          <img
            src={setting.qrImageUrl}
            alt={setting.title}
            className="h-36 w-36 rounded-md object-contain"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminPaymentField
            name="title"
            label="Tên QR"
            defaultValue={setting.title}
            required
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase text-slate-600">
              Loại
            </span>
            <select
              name="provider"
              defaultValue={setting.provider}
              className="mt-2 h-10 w-full rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >
              {paymentProviders.map((provider) => (
                <option key={provider.value} value={provider.value}>
                  {provider.label}
                </option>
              ))}
            </select>
          </label>
          <AdminPaymentField
            name="bankName"
            label="Ngân hàng/ví"
            defaultValue={setting.bankName ?? ""}
          />
          <AdminPaymentField
            name="accountName"
            label="Tên tài khoản"
            defaultValue={setting.accountName ?? ""}
          />
          <AdminPaymentField
            name="accountNumber"
            label="Số tài khoản"
            defaultValue={setting.accountNumber ?? ""}
          />
          <AdminPaymentField
            name="sortOrder"
            label="Thứ tự"
            type="number"
            defaultValue={String(setting.sortOrder)}
          />
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-600">
              URL ảnh QR
            </span>
            <input
              name="qrImageUrl"
              defaultValue={setting.qrImageUrl}
              required
              className="mt-2 h-10 w-full rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-slate-600">
              Hướng dẫn
            </span>
            <textarea
              name="instructions"
              rows={2}
              defaultValue={setting.instructions ?? ""}
              className="mt-2 w-full rounded-md border border-cyan-950/15 px-3 py-2 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={setting.isActive}
              className="h-4 w-4 accent-cyan-500"
            />
            Đang bật
          </label>
        </div>
        <div className="flex gap-2 md:flex-col">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-10 items-center justify-center rounded-md bg-cyan-500 px-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:opacity-60"
          >
            Lưu
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (window.confirm("Xác nhận xóa QR này?")) {
                void runAction(() => deleteAdminPaymentQrSetting(setting.id));
              }
            }}
            className="grid h-10 w-10 place-items-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            aria-label="Xóa QR"
            title="Xóa QR"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </form>
  );
}

function AdminPaymentField({
  name,
  label,
  defaultValue,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-slate-600">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-cyan-950/15 px-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
      />
    </label>
  );
}
