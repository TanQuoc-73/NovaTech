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

const paymentProviders = [
  { value: "bank_transfer", label: "QR test / chuyen khoan" },
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
      .catch(() => setMessage("Khong the tai cau hinh thanh toan."))
      .finally(() => setIsLoading(false));
  }, []);

  async function runAction(action: () => Promise<AdminDashboard>) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      setDashboard(await action());
      setMessage("Da cap nhat cau hinh thanh toan.");
    } catch {
      setMessage("Thao tac khong thanh cong. Kiem tra lai du lieu QR.");
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
      setMessage("Da upload anh QR.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Khong the upload QR.");
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
    return (
      <section className="grid min-h-[320px] place-items-center text-sm font-semibold text-stone-600">
        Dang tai cau hinh thanh toan...
      </section>
    );
  }

  const settings = dashboard?.paymentQrSettings ?? [];

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
            Payment
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Quan ly QR thanh toan</h1>
        </div>
      </div>

      {message ? (
        <div className="mt-5 rounded-md bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleCreate}
          className="h-fit rounded-lg border border-amber-900/10 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-amber-800" aria-hidden="true" />
            <h2 className="font-semibold">Them QR test</h2>
          </div>

          <div className="mt-5 grid gap-4">
            <AdminPaymentField name="title" label="Ten QR" required />
            <label className="block">
              <span className="text-xs font-semibold uppercase text-stone-600">
                Loai thanh toan
              </span>
              <select
                name="provider"
                className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              >
                {paymentProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.label}
                  </option>
                ))}
              </select>
            </label>
            <AdminPaymentField name="bankName" label="Ngan hang/vi" />
            <AdminPaymentField name="accountName" label="Ten tai khoan" />
            <AdminPaymentField name="accountNumber" label="So tai khoan" />
            <AdminPaymentField name="sortOrder" label="Thu tu" type="number" />

            <label className="block">
              <span className="text-xs font-semibold uppercase text-stone-600">
                Anh QR
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="mt-2 block w-full text-sm font-semibold text-stone-600 file:mr-3 file:h-10 file:rounded-md file:border-0 file:bg-amber-700 file:px-3 file:text-sm file:font-semibold file:text-white"
              />
            </label>

            {qrImageUrl ? (
              <div className="rounded-lg border border-amber-900/10 bg-amber-50 p-3">
                <img
                  src={qrImageUrl}
                  alt="QR preview"
                  className="mx-auto h-44 w-44 rounded-md object-contain"
                />
              </div>
            ) : null}

            <label className="block">
              <span className="text-xs font-semibold uppercase text-stone-600">
                Huong dan
              </span>
              <textarea
                name="instructions"
                rows={3}
                className="mt-2 w-full rounded-md border border-amber-900/15 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked
                className="h-4 w-4 accent-amber-700"
              />
              Dang bat
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isUploading || !qrImageUrl}
            className="mt-5 h-11 w-full rounded-md bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? "Dang upload..." : "Luu QR"}
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
            <div className="rounded-lg border border-amber-900/10 bg-white p-6 text-sm font-semibold text-stone-600">
              Chua co QR test nao.
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
      className="rounded-lg border border-amber-900/10 bg-white p-4 shadow-sm"
    >
      <div className="grid gap-4 md:grid-cols-[160px_1fr_auto]">
        <div className="grid place-items-center rounded-lg bg-amber-50 p-3">
          <img
            src={setting.qrImageUrl}
            alt={setting.title}
            className="h-36 w-36 rounded-md object-contain"
          />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminPaymentField
            name="title"
            label="Ten QR"
            defaultValue={setting.title}
            required
          />
          <label className="block">
            <span className="text-xs font-semibold uppercase text-stone-600">
              Loai
            </span>
            <select
              name="provider"
              defaultValue={setting.provider}
              className="mt-2 h-10 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
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
            label="Ngan hang/vi"
            defaultValue={setting.bankName ?? ""}
          />
          <AdminPaymentField
            name="accountName"
            label="Ten tai khoan"
            defaultValue={setting.accountName ?? ""}
          />
          <AdminPaymentField
            name="accountNumber"
            label="So tai khoan"
            defaultValue={setting.accountNumber ?? ""}
          />
          <AdminPaymentField
            name="sortOrder"
            label="Thu tu"
            type="number"
            defaultValue={String(setting.sortOrder)}
          />
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-stone-600">
              URL anh QR
            </span>
            <input
              name="qrImageUrl"
              defaultValue={setting.qrImageUrl}
              required
              className="mt-2 h-10 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="text-xs font-semibold uppercase text-stone-600">
              Huong dan
            </span>
            <textarea
              name="instructions"
              rows={2}
              defaultValue={setting.instructions ?? ""}
              className="mt-2 w-full rounded-md border border-amber-900/15 px-3 py-2 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
            />
          </label>
          <label className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700">
            <input
              name="isActive"
              type="checkbox"
              defaultChecked={setting.isActive}
              className="h-4 w-4 accent-amber-700"
            />
            Dang bat
          </label>
        </div>
        <div className="flex gap-2 md:flex-col">
          <button
            type="submit"
            disabled={disabled}
            className="inline-flex h-10 items-center justify-center rounded-md bg-amber-700 px-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:opacity-60"
          >
            Luu
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              void runAction(() => deleteAdminPaymentQrSetting(setting.id))
            }
            className="grid h-10 w-10 place-items-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            aria-label="Xoa QR"
            title="Xoa QR"
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
      <span className="text-xs font-semibold uppercase text-stone-600">
        {label}
      </span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="mt-2 h-10 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      />
    </label>
  );
}
