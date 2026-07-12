"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Home, Trash2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import {
  createAddress,
  deleteAddress,
  getAddresses,
  syncAuthProfileSafely,
  updateAddress,
  type Address,
  type AuthProfile,
} from "@/features/auth/model/auth-client";
import { getSupabaseClient } from "@/shared/lib/supabase/client";
import { AccountSidebar } from "@/features/account/ui/account-sidebar";

function ProfileField({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-stone-600">
        {label}
      </span>
      <input
        name={name}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
      />
    </label>
  );
}

export default function AccountAddressesPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<AuthProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [pendingAddressId, setPendingAddressId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;

      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        void syncAuthProfileSafely().then(setProfile);
        void getAddresses().then(setAddresses).catch(() => setAddresses([]));
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      const sessionUser = session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        void syncAuthProfileSafely().then(setProfile);
        void getAddresses().then(setAddresses).catch(() => setAddresses([]));
      } else {
        setProfile(null);
        setAddresses([]);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const displayName =
    profile?.full_name ?? user?.user_metadata?.full_name ?? "Tài khoản NovaTech";

  async function handleCreateAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddressMessage(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      setAddresses(
        await createAddress({
          recipientName: String(formData.get("recipientName") ?? ""),
          phone: String(formData.get("addressPhone") ?? ""),
          province: String(formData.get("province") ?? ""),
          district: String(formData.get("district") ?? ""),
          ward: String(formData.get("ward") ?? ""),
          line1: String(formData.get("line1") ?? ""),
          line2: String(formData.get("line2") ?? ""),
          isDefault: formData.get("isDefault") === "on",
        }),
      );
      form.reset();
      setAddressMessage("Đã thêm địa chỉ giao hàng.");
    } catch {
      setAddressMessage("Không thể lưu địa chỉ. Kiểm tra lại thông tin.");
    }
  }

  async function handleSetDefaultAddress(addressId: string) {
    setPendingAddressId(addressId);
    setAddressMessage(null);

    try {
      setAddresses(await updateAddress(addressId, { isDefault: true }));
      setAddressMessage("Đã đặt địa chỉ mặc định.");
    } catch {
      setAddressMessage("Không thể cập nhật địa chỉ.");
    } finally {
      setPendingAddressId(null);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    setPendingAddressId(addressId);
    setAddressMessage(null);

    try {
      setAddresses(await deleteAddress(addressId));
      setAddressMessage("Đã xóa địa chỉ.");
    } catch {
      setAddressMessage("Không thể xóa địa chỉ.");
    } finally {
      setPendingAddressId(null);
    }
  }

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl animate-pulse px-6 py-12 lg:px-8">
        <div className="h-9 w-48 rounded bg-slate-200" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="h-40 rounded-lg border border-slate-950/10 bg-white p-2" />
          <div className="space-y-4">
            <div className="h-64 rounded-lg border border-slate-950/10 bg-white p-6" />
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <p className="text-sm text-stone-500">Vui lòng đăng nhập để quản lý địa chỉ.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-amber-800">
          Tài khoản
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Địa chỉ giao hàng</h1>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
        <AccountSidebar />

        <div className="rounded-lg border border-amber-900/10 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold">Quản lý địa chỉ</h2>
              <p className="mt-1 text-sm text-stone-500">
                Thêm và chỉnh sửa địa chỉ để dùng nhanh khi thanh toán.
              </p>
            </div>
            {addressMessage ? (
              <span className="rounded-full bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-900">
                {addressMessage}
              </span>
            ) : null}
          </div>

          <form
            onSubmit={handleCreateAddress}
            className="mt-5 grid gap-4 md:grid-cols-2"
          >
            <ProfileField
              name="recipientName"
              label="Người nhận"
              defaultValue={displayName}
            />
            <ProfileField
              name="addressPhone"
              label="Số điện thoại"
              defaultValue={profile?.phone ?? ""}
            />
            <ProfileField name="province" label="Tỉnh/Thành phố" defaultValue="" />
            <ProfileField name="district" label="Quận/Huyện" defaultValue="" />
            <ProfileField name="ward" label="Phường/Xã" defaultValue="" />
            <ProfileField name="line1" label="Địa chỉ chi tiết" defaultValue="" />
            <label className="block md:col-span-2">
              <span className="text-xs font-semibold uppercase text-stone-600">
                Ghi chú địa chỉ
              </span>
              <input
                name="line2"
                className="mt-2 h-11 w-full rounded-md border border-amber-900/15 px-3 text-sm font-semibold outline-none focus:border-amber-700 focus:ring-4 focus:ring-amber-200/70"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
              <input name="isDefault" type="checkbox" className="h-4 w-4 accent-amber-700" />
              Đặt làm địa chỉ mặc định
            </label>
            <div className="md:text-right">
              <button
                type="submit"
                className="h-10 rounded-md bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
              >
                Thêm địa chỉ
              </button>
            </div>
          </form>

          <div className="mt-6 grid gap-3">
            {addresses.length ? (
              addresses.map((address) => (
                <article
                  key={address.id}
                  className="rounded-lg border border-amber-900/10 bg-[#fffdf7] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{address.recipientName}</p>
                        {address.isDefault ? (
                          <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                            Mặc định
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm font-medium text-stone-600">
                        {address.phone}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {[address.line1, address.line2, address.ward, address.district, address.province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!address.isDefault ? (
                        <button
                          type="button"
                          disabled={pendingAddressId !== null}
                          onClick={() => void handleSetDefaultAddress(address.id)}
                          className="grid h-10 w-10 place-items-center rounded-full border border-amber-900/15 text-amber-800 transition hover:bg-amber-100 disabled:opacity-50"
                          aria-label="Đặt địa chỉ mặc định"
                        >
                          <Home className="h-4 w-4" aria-hidden="true" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={pendingAddressId !== null}
                        onClick={() => void handleDeleteAddress(address.id)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label="Xóa địa chỉ"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-amber-900/20 bg-[#fffdf7] p-5 text-sm font-medium text-stone-500">
                Chưa có địa chỉ giao hàng.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
