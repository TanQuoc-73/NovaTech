"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Mail, User, X } from "lucide-react";

import {
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  syncAuthProfileSafely,
  getRoleHomePath,
  resetPasswordForEmail,
} from "../model/auth-client";
import { getDictionary, type Dictionary } from "@/shared/i18n";

type AuthMode = "login" | "register" | "forgot-password";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dictionary?: Dictionary;
};

export function AuthModal({
  isOpen,
  onClose,
  dictionary = getDictionary("vi"),
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [animating, setAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      setMode("login");
      setMessage(null);
      setIsSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const t = dictionary.ui.auth;

  function switchMode(next: AuthMode) {
    if (animating) return;
    setAnimating(true);
    setMessage(null);
    setIsSuccess(false);
    setTimeout(() => {
      setMode(next);
      setAnimating(false);
    }, 180);
  }

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
      setMessage(error instanceof Error ? error.message : t.signInFailed);
      setIsSubmitting(false);
    }
  }

  async function handleLoginRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const fullName = String(formData.get("fullName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const isLogin = mode === "login";

    if (!isLogin && password !== confirmPassword) {
      setMessage(t.passwordMismatch);
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
      setMessage(error instanceof Error ? error.message : t.authFailed);
      setIsSubmitting(false);
      return;
    }

    setMessage(mode === "login" ? t.loginSuccess : t.registerSuccess);
    setIsSubmitting(false);
    if (mode === "login") onClose();
  }

  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");

    try {
      const { error } = await resetPasswordForEmail(email);
      if (error) {
        setMessage(error.message);
      } else {
        setIsSuccess(true);
        setMessage(t.forgotPasswordEmailSent);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t.authFailed);
    } finally {
      setIsSubmitting(false);
    }
  }

  const brandGradient =
    "linear-gradient(135deg, #09090B 0%, #0E7490 50%, #06B6D4 100%)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: "rgba(15,23,42,0.75)", backdropFilter: "blur(6px)" }}
    >
      {/* Backdrop close */}
      <button
        type="button"
        aria-label={t.close}
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />

      {/* Modal card */}
      <section
        className="relative z-10 flex w-full max-w-[860px] overflow-hidden rounded-2xl shadow-2xl"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.5)" }}
      >
        {/* ── LEFT: Brand panel ── */}
        <div
          className="hidden w-[340px] shrink-0 flex-col justify-between p-10 md:flex"
          style={{ background: brandGradient }}
        >
          {/* Logo */}
          <div>
            <span className="inline-flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400">
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-slate-950" aria-hidden="true">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </span>
              <span className="text-lg font-bold tracking-tight text-white">
                NovaTech
              </span>
            </span>

            <p className="mt-8 text-2xl font-semibold leading-snug text-white">
              {t.brandTagline}
            </p>
            <p className="mt-3 text-sm font-medium text-cyan-200/80">
              {t.brandDescription}
            </p>
          </div>

          {/* Stats / decorative */}
          <div className="space-y-3">
            {[
              { value: "240+", label: "Sản phẩm" },
              { value: "32", label: "Thương hiệu" },
              { value: "24/7", label: "Hỗ trợ" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-cyan-400/20 bg-white/5 px-4 py-3"
              >
                <span className="text-lg font-bold text-cyan-300">
                  {stat.value}
                </span>
                <span className="text-sm font-medium text-white/70">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Form panel ── */}
        <div className="flex flex-1 flex-col bg-white">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
            <div className="flex items-center gap-2.5">
              {/* Back button for forgot-password */}
              {mode === "forgot-password" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                  aria-label={t.backToLogin}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">
                  {t.eyebrow}
                </p>
                <h2 className="mt-0.5 text-xl font-semibold text-slate-900">
                  {mode === "login"
                    ? t.loginTitle
                    : mode === "register"
                      ? t.registerTitle
                      : t.forgotPasswordTitle}
                </h2>
              </div>
            </div>
            <button
              type="button"
              aria-label={t.close}
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {/* Tab switcher (only login/register) */}
            {mode !== "forgot-password" && (
              <div className="mb-6 grid grid-cols-2 rounded-xl border border-slate-200 bg-slate-100/60 p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`h-9 rounded-lg text-sm font-semibold transition ${
                    mode === "login"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.loginTab}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`h-9 rounded-lg text-sm font-semibold transition ${
                    mode === "register"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {t.registerTab}
                </button>
              </div>
            )}

            {/* Animated form area */}
            <div
              ref={panelRef}
              style={{
                opacity: animating ? 0 : 1,
                transform: animating ? "translateY(6px)" : "translateY(0)",
                transition: "opacity 180ms ease, transform 180ms ease",
              }}
            >
              {/* ── FORGOT PASSWORD ── */}
              {mode === "forgot-password" && (
                <div>
                  {isSuccess ? (
                    <div className="flex flex-col items-center py-6 text-center">
                      <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                      </span>
                      <p className="mt-5 text-base font-semibold text-slate-900">
                        {t.forgotPasswordEmailSent}
                      </p>
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="mt-6 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                      >
                        {t.backToLogin}
                      </button>
                    </div>
                  ) : (
                    <form className="grid gap-4" onSubmit={handleForgotPassword}>
                      <p className="text-sm leading-6 text-slate-500">
                        {t.forgotPasswordSubtitle}
                      </p>
                      <AuthInput
                        icon={<Mail className="h-4 w-4" />}
                        name="email"
                        type="email"
                        required
                        placeholder="you@novatech.vn"
                        label="Email"
                      />
                      {message && !isSuccess && (
                        <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700">
                          {message}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? t.processing : t.sendResetEmail}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-center text-sm font-semibold text-slate-500 transition hover:text-slate-900"
                      >
                        {t.backToLogin}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* ── LOGIN / REGISTER ── */}
              {mode !== "forgot-password" && (
                <div>
                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GoogleIcon className="h-5 w-5 shrink-0" />
                    Tiếp tục với Google
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-slate-200" />
                    <span className="text-xs font-semibold text-slate-400">
                      hoặc dùng email
                    </span>
                    <span className="h-px flex-1 bg-slate-200" />
                  </div>

                  <form className="grid gap-3.5" onSubmit={handleLoginRegister}>
                    {mode === "register" && (
                      <AuthInput
                        icon={<User className="h-4 w-4" />}
                        name="fullName"
                        type="text"
                        placeholder={t.fullNamePlaceholder}
                        label={t.fullName}
                      />
                    )}
                    <AuthInput
                      icon={<Mail className="h-4 w-4" />}
                      name="email"
                      type="email"
                      required
                      placeholder="you@novatech.vn"
                      label="Email"
                    />
                    <AuthInput
                      icon={<Lock className="h-4 w-4" />}
                      name="password"
                      type="password"
                      required
                      placeholder={t.passwordPlaceholder}
                      label={t.password}
                    />
                    {mode === "register" && (
                      <AuthInput
                        icon={<Lock className="h-4 w-4" />}
                        name="confirmPassword"
                        type="password"
                        required
                        placeholder={t.confirmPasswordPlaceholder}
                        label={t.confirmPassword}
                      />
                    )}

                    {mode === "login" && (
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-500">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-cyan-600"
                          />
                          {t.remember}
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode("forgot-password")}
                          className="text-sm font-semibold text-cyan-600 transition hover:text-cyan-700"
                        >
                          {t.forgotPassword}
                        </button>
                      </div>
                    )}

                    {message && (
                      <p
                        className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                          message === t.loginSuccess ||
                          message === t.registerSuccess
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-1 h-11 rounded-xl bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? t.processing
                        : mode === "login"
                          ? t.loginTab
                          : t.registerTab}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-slate-500">
                    {mode === "login" ? t.noAccount : t.hasAccount}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        switchMode(mode === "login" ? "register" : "login")
                      }
                      className="font-semibold text-cyan-600 transition hover:text-cyan-700"
                    >
                      {mode === "login" ? t.registerNow : t.loginTab}
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Reusable input ──────────────────────────────────────────────────────────

type AuthInputProps = {
  icon: React.ReactNode;
  name: string;
  type: string;
  required?: boolean;
  placeholder: string;
  label: string;
};

function AuthInput({ icon, name, type, required, placeholder, label }: AuthInputProps) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      <span className="flex h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 text-slate-400 transition focus-within:border-cyan-500 focus-within:ring-3 focus-within:ring-cyan-200/60">
        {icon}
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}

// ── Google icon ─────────────────────────────────────────────────────────────

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.74-.07-1.45-.19-2.14H12v4.05h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.32 2.98-7.44Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.43l-3.24-2.51c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.4 13.89a6 6 0 0 1 0-3.78V7.52H3.06a10 10 0 0 0 0 8.96l3.34-2.59Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.99c1.47 0 2.79.5 3.83 1.5l2.87-2.88C16.96 2.99 14.7 2 12 2a10 10 0 0 0-8.94 5.52l3.34 2.59C7.2 7.75 9.4 5.99 12 5.99Z"
      />
    </svg>
  );
}
