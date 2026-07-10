"use client";

import React, { useEffect, useRef, useState } from "react";
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

  const brandGradient = "var(--brand-gradient)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
      style={{ background: "var(--backdrop)", backdropFilter: "blur(6px)" }}
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
        style={{ boxShadow: "var(--shadow-modal)" }}
      >
        {/* ── LEFT: Brand panel ── */}
        <div
          className="hidden w-[340px] shrink-0 flex-col justify-between p-10 md:flex"
          style={{ background: brandGradient }}
        >
          {/* Logo */}
          <div>
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

            <p className="mt-8 text-2xl font-semibold leading-snug text-white">
              {t.brandTagline}
            </p>
            <p className="mt-3 text-sm font-medium text-white/80">
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
                <span className="text-lg font-bold text-white">
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
        <div className="auth-form-panel flex flex-1 flex-col bg-[#2d3042]"
          style={{
            "--background": "#2d3042",
            "--surface": "#3d4055",
            "--surface-soft": "#494d63",
            "--foreground": "#f8fafc",
            "--muted": "#94a3b8",
            "--border": "rgba(125, 211, 252, 0.22)",
          } as React.CSSProperties}
        >
          {/* Header */}
          <div className="auth-form-header flex items-center justify-between border-b border-[var(--border)] px-7 py-5">
            <div className="flex items-center gap-2.5">
              {/* Back button for forgot-password */}
              {mode === "forgot-password" && (
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="auth-form-btn-secondary grid h-8 w-8 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
                  aria-label={t.backToLogin}
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">
                  {t.eyebrow}
                </p>
                <h2 className="mt-0.5 text-xl font-semibold text-[var(--foreground)]">
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
              className="auth-form-btn-secondary grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-7 py-6">
            {/* Tab switcher (only login/register) */}
            {mode !== "forgot-password" && (
              <div className="auth-form-tabs mb-6 grid grid-cols-2 rounded-xl border border-[var(--border)] p-1">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`auth-form-tab h-9 rounded-lg text-sm font-semibold transition ${
                    mode === "login"
                      ? "auth-form-tab-active bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  {t.loginTab}
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`auth-form-tab h-9 rounded-lg text-sm font-semibold transition ${
                    mode === "register"
                      ? "auth-form-tab-active bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]"
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
                      <span className="grid h-16 w-16 place-items-center rounded-full" style={{ background: "var(--success-bg)" }}>
                        <CheckCircle2 className="h-8 w-8 text-[var(--success)]" />
                      </span>
                      <p className="mt-5 text-base font-semibold text-[var(--foreground)]">
                        {t.forgotPasswordEmailSent}
                      </p>
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="mt-6 text-sm font-semibold text-[var(--primary)] hover:opacity-80"
                      >
                        {t.backToLogin}
                      </button>
                    </div>
                  ) : (
                    <form className="grid gap-4" onSubmit={handleForgotPassword}>
                      <p className="text-sm leading-6 text-[var(--muted)]">
                        {t.forgotPasswordSubtitle}
                      </p>
                      <AuthInput
                        icon={<Mail className="h-4 w-4" />}
                        name="email"
                        type="email"
                        required
                        placeholder="youremail@gmail.com"
                        label="Email"
                      />
                      {message && !isSuccess && (
                        <p className="rounded-lg px-3 py-2.5 text-sm font-medium" style={{ background: "var(--danger-bg)", color: "var(--danger)" }}>
                          {message}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-11 rounded-xl bg-[var(--primary)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSubmitting ? t.processing : t.sendResetEmail}
                      </button>
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-center text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
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
                    className="auth-form-btn-secondary flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--surface-soft)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <GoogleIcon className="h-5 w-5 shrink-0" />
                    Tiếp tục với Google
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-[var(--border)]" />
                    <span className="text-xs font-semibold text-[var(--muted)]">
                      hoặc dùng email
                    </span>
                    <span className="h-px flex-1 bg-[var(--border)]" />
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
                       placeholder="youremail@gmail.com"
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
                        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-[var(--primary)]"
                          />
                          {t.remember}
                        </label>
                        <button
                          type="button"
                          onClick={() => switchMode("forgot-password")}
                          className="text-sm font-semibold text-[var(--primary)] transition hover:opacity-80"
                        >
                          {t.forgotPassword}
                        </button>
                      </div>
                    )}

                    {message && (
                      <p
                        className="rounded-lg px-3 py-2.5 text-sm font-medium"
                        style={{
                          background:
                            message === t.loginSuccess || message === t.registerSuccess
                              ? "var(--success-bg)"
                              : "var(--danger-bg)",
                          color:
                            message === t.loginSuccess || message === t.registerSuccess
                              ? "var(--success)"
                              : "var(--danger)",
                        }}
                      >
                        {message}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="mt-1 h-11 rounded-xl bg-[var(--primary)] text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? t.processing
                        : mode === "login"
                          ? t.loginTab
                          : t.registerTab}
                    </button>
                  </form>

                  <p className="mt-5 text-center text-sm text-[var(--muted)]">
                    {mode === "login" ? t.noAccount : t.hasAccount}{" "}
                    <button
                      type="button"
                      onClick={() =>
                        switchMode(mode === "login" ? "register" : "login")
                      }
                      className="font-semibold text-[var(--primary)] transition hover:opacity-80"
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
      <span className="text-xs font-semibold text-[var(--muted)]">{label}</span>
      <span className="auth-form-input flex h-11 items-center gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 text-[var(--muted)] transition focus-within:border-[var(--primary)] focus-within:ring-3 focus-within:ring-[var(--primary)]/20">
        {icon}
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
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
