"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Lock, ShieldCheck } from "lucide-react";

import {
  consumeAuthRedirectSession,
  updatePassword,
} from "@/features/auth/model/auth-client";
import { getDictionary, resolveLocale } from "@/shared/i18n";

export default function ResetPasswordPage() {
  const dictionary = getDictionary(resolveLocale(undefined));
  const t = dictionary.ui.auth;

  const [status, setStatus] = useState<"loading" | "ready" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Consume the reset token from URL hash on mount
  useEffect(() => {
    consumeAuthRedirectSession()
      .then((session) => {
        if (session) {
          setStatus("ready");
        } else {
          setStatus("error");
          setErrorMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.");
      });
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError(null);

    if (password !== confirmPassword) {
      setValidationError(t.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setValidationError("Mật khẩu phải có ít nhất 8 ký tự.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setValidationError(error.message);
      } else {
        setStatus("success");
      }
    } catch (error) {
      setValidationError(
        error instanceof Error ? error.message : t.resetPasswordFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eaf6fb] text-slate-900">
      {/* Top bar */}
      <header className="border-b border-cyan-900/10 bg-white px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-400">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-slate-950" aria-hidden="true">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </span>
          <span className="text-base font-bold tracking-tight text-slate-900">
            NovaTech
          </span>
        </Link>
      </header>

      {/* Main content */}
      <div className="mx-auto flex min-h-[calc(100vh-65px)] max-w-md flex-col items-center justify-center px-6 py-12">
        <div className="w-full rounded-2xl border border-cyan-900/10 bg-white p-8 shadow-sm">

          {/* ── LOADING ── */}
          {status === "loading" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <span className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600" />
              <p className="text-sm font-medium text-slate-500">Đang xác thực liên kết...</p>
            </div>
          )}

          {/* ── ERROR ── */}
          {status === "error" && (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-red-100">
                <ShieldCheck className="h-8 w-8 text-red-500" />
              </span>
              <h1 className="mt-5 text-xl font-semibold text-slate-900">
                Liên kết không hợp lệ
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {errorMessage}
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-10 items-center rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Về trang chủ
              </Link>
            </div>
          )}

          {/* ── SUCCESS ── */}
          {status === "success" && (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </span>
              <h1 className="mt-5 text-xl font-semibold text-slate-900">
                {t.resetPasswordSuccess}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex h-10 items-center rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white transition hover:bg-cyan-700"
              >
                Về trang chủ và đăng nhập
              </Link>
            </div>
          )}

          {/* ── FORM ── */}
          {status === "ready" && (
            <div>
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">
                  NovaTech
                </p>
                <h1 className="mt-1.5 text-2xl font-semibold text-slate-900">
                  {t.resetPasswordTitle}
                </h1>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">
                  {t.resetPasswordSubtitle}
                </p>
              </div>

              <form className="grid gap-4" onSubmit={handleSubmit}>
                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">
                    {t.newPassword}
                  </span>
                  <span className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-400 transition focus-within:border-cyan-500 focus-within:ring-3 focus-within:ring-cyan-200/60">
                    <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      placeholder={t.newPasswordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </span>
                  <span className="text-xs text-slate-400">Ít nhất 8 ký tự</span>
                </label>

                <label className="grid gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">
                    {t.confirmNewPassword}
                  </span>
                  <span className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-400 transition focus-within:border-cyan-500 focus-within:ring-3 focus-within:ring-cyan-200/60">
                    <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      placeholder={t.confirmNewPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </span>
                </label>

                {validationError && (
                  <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                    {validationError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-1 h-11 rounded-xl bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? t.processing : t.resetPasswordTitle}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                <Link href="/" className="font-semibold text-cyan-600 transition hover:text-cyan-700">
                  {t.backToLogin}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
