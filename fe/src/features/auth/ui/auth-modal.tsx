"use client";

import { useState } from "react";
import { Lock, Mail, User, X } from "lucide-react";

import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  syncAuthProfileSafely,
  getRoleHomePath,
} from "../model/auth-client";

type AuthMode = "login" | "register";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const isLogin = mode === "login";

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Khong the dang nhap.");
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!isLogin && password !== confirmPassword) {
      setMessage("Mat khau xac nhan khong khop.");
      setIsSubmitting(false);
      return;
    }

    try {
    const { data, error } = isLogin
      ? await signInWithEmail({ email, password })
      : await signUpWithEmail({ email, password, fullName });

      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        const profile = await syncAuthProfileSafely();

        if (profile) {
          const roleHomePath = getRoleHomePath(profile.role);

          if (roleHomePath !== window.location.pathname) {
            window.location.href = roleHomePath;
            return;
          }

          onClose();
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Khong the xac thuc.");
      setIsSubmitting(false);
      return;
    }

    setMessage(
      isLogin
        ? "Dang nhap thanh cong."
        : "Dang ky thanh cong. Vui long kiem tra email neu Supabase yeu cau xac thuc.",
    );
    setIsSubmitting(false);

    if (isLogin) {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/70 px-4 py-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Dong cua so dang nhap"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      <section className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-200/60 bg-[#fffaf2] shadow-2xl shadow-stone-950/30">
        <div className="border-b border-amber-900/10 bg-[#3b2418] px-6 py-5 text-amber-50">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                NovaTech Account
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {isLogin ? "Dang nhap" : "Tao tai khoan"}
              </h2>
            </div>
            <button
              type="button"
              aria-label="Dong"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-md border border-white/15 text-amber-50 transition hover:bg-white/10"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 rounded-lg border border-amber-900/10 bg-amber-100/50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                isLogin
                  ? "bg-white text-stone-950 shadow-sm"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Dang nhap
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                !isLogin
                  ? "bg-white text-stone-950 shadow-sm"
                  : "text-stone-600 hover:text-stone-950"
              }`}
            >
              Dang ky
            </button>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md border border-amber-900/15 bg-white text-sm font-semibold text-stone-900 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-amber-900/10" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              Email
            </span>
            <span className="h-px flex-1 bg-amber-900/10" />
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit}>
            {!isLogin ? (
              <label className="grid gap-2 text-sm font-semibold text-stone-800">
                <span className="sr-only">Ho va ten</span>
                <span className="flex h-11 items-center gap-2 rounded-md border border-amber-900/15 bg-white px-3 text-stone-500 transition focus-within:border-amber-700 focus-within:ring-4 focus-within:ring-amber-200/70">
                  <User className="h-4 w-4" aria-hidden="true" />
                  <input
                    name="fullName"
                    type="text"
                    placeholder="Nguyen Van A"
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-stone-950 outline-none placeholder:text-stone-400"
                  />
                </span>
              </label>
            ) : null}

            <label className="grid gap-2 text-sm font-semibold text-stone-800">
              <span className="sr-only">Email</span>
              <span className="flex h-11 items-center gap-2 rounded-md border border-amber-900/15 bg-white px-3 text-stone-500 transition focus-within:border-amber-700 focus-within:ring-4 focus-within:ring-amber-200/70">
                <Mail className="h-4 w-4" aria-hidden="true" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="you@novatech.vn"
                  className="min-w-0 flex-1 bg-transparent text-sm font-normal text-stone-950 outline-none placeholder:text-stone-400"
                />
              </span>
            </label>

            <label className="grid gap-2 text-sm font-semibold text-stone-800">
              <span className="sr-only">Mat khau</span>
              <span className="flex h-11 items-center gap-2 rounded-md border border-amber-900/15 bg-white px-3 text-stone-500 transition focus-within:border-amber-700 focus-within:ring-4 focus-within:ring-amber-200/70">
                <Lock className="h-4 w-4" aria-hidden="true" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Nhap mat khau"
                  className="min-w-0 flex-1 bg-transparent text-sm font-normal text-stone-950 outline-none placeholder:text-stone-400"
                />
              </span>
            </label>

            {!isLogin ? (
              <label className="grid gap-2 text-sm font-semibold text-stone-800">
                <span className="sr-only">Xac nhan mat khau</span>
                <span className="flex h-11 items-center gap-2 rounded-md border border-amber-900/15 bg-white px-3 text-stone-500 transition focus-within:border-amber-700 focus-within:ring-4 focus-within:ring-amber-200/70">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    placeholder="Nhap lai mat khau"
                    className="min-w-0 flex-1 bg-transparent text-sm font-normal text-stone-950 outline-none placeholder:text-stone-400"
                  />
                </span>
              </label>
            ) : null}

            {isLogin ? (
              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex items-center gap-2 text-stone-600">
                  <input type="checkbox" className="h-4 w-4 accent-amber-700" />
                  Ghi nho
                </label>
                <a href="#" className="font-semibold text-amber-800 hover:text-amber-900">
                  Quen mat khau?
                </a>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-11 rounded-md bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Dang xu ly..." : isLogin ? "Dang nhap" : "Dang ky"}
            </button>
          </form>

          {message ? (
            <p className="mt-4 rounded-md bg-amber-100 px-3 py-2 text-sm text-stone-700">
              {message}
            </p>
          ) : null}

          <p className="mt-5 text-center text-sm text-stone-600">
            {isLogin ? "Chua co tai khoan?" : "Da co tai khoan?"}{" "}
            <button
              type="button"
              onClick={() => setMode(isLogin ? "register" : "login")}
              className="font-semibold text-amber-800 hover:text-amber-900"
            >
              {isLogin ? "Dang ky ngay" : "Dang nhap"}
            </button>
          </p>
        </div>
      </section>
    </div>
  );
}
