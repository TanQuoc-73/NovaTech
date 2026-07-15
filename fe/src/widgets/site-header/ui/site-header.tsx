"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LogOut,
  Moon,
  Search,
  ShoppingCart,
  Sun,
  Trash2,
  User,
  UserCircle,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Product } from "@/entities/product";

import { AuthModal } from "@/features/auth";
import {
  consumeAuthRedirectSession,
  getRoleHomePath,
  signOut,
  syncAuthProfileSafely,
} from "@/features/auth/model/auth-client";
import {
  getCart,
  removeCartItem,
  type Cart,
} from "@/features/cart/api/cart-api";
import { locales, type Dictionary, type Locale } from "@/shared/i18n";
import { formatCurrency } from "@/shared/lib/format-currency";
import { getSupabaseClient } from "@/shared/lib/supabase/client";

type SiteHeaderProps = {
  dictionary: Dictionary;
  locale: Locale;
  searchQuery?: string;
};

const navItems = [
  { key: "categories", href: "/categories" },
  { key: "products", href: "/products" },
  { key: "news", href: "/news" },
  { key: "warranty", href: "/warranty" },
] as const;

const localeOptions: Record<Locale, { flagCode: string; label: string }> = {
  vi: { flagCode: "vn", label: "Tieng Viet" },
  en: { flagCode: "us", label: "English" },
  zh: { flagCode: "cn", label: "中文" },
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type FlyingCartItem = {
  id: number;
  productBrand: string;
  productName: string;
  from: {
    x: number;
    y: number;
  };
  to: {
    x: number;
    y: number;
  };
  isActive: boolean;
};

type CartUpdatedEventDetail = {
  cart: Cart;
  productName: string;
  productBrand: string;
  sourceRect: {
    x: number;
    y: number;
  };
};

type ThemeMode = "light" | "dark";

export function SiteHeader({ dictionary, locale, searchQuery }: SiteHeaderProps) {
  const pathname = usePathname();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(searchQuery ?? "");
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [pendingCartItemId, setPendingCartItemId] = useState<string | null>(null);
  const [flyingCartItem, setFlyingCartItem] = useState<FlyingCartItem | null>(
    null,
  );
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const searchRef = useRef<HTMLFormElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const cartMenuRef = useRef<HTMLDivElement | null>(null);
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const currentTheme =
        document.documentElement.dataset.theme === "light" ? "light" : "dark";

      setTheme(currentTheme);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseClient>;

    try {
      supabase = getSupabaseClient();
    } catch {
      return;
    }

    const syncProfileAndRedirect = () => {
      void syncAuthProfileSafely().then((profile) => {
        if (!profile || window.location.pathname !== "/") {
          return;
        }

        const roleHomePath = getRoleHomePath(profile.role);

        if (roleHomePath !== window.location.pathname) {
          window.location.href = roleHomePath;
        }
      });
    };

    const initializeSession = async () => {
      const redirectSession = await consumeAuthRedirectSession().catch(
        (error) => {
          console.warn(error);
          return null;
        },
      );
      const session =
        redirectSession ?? (await supabase.auth.getSession()).data.session;

      setUser(session?.user ?? null);

      if (session?.user) {
        syncProfileAndRedirect();
        void refreshCart();
      }
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        syncProfileAndRedirect();
        void refreshCart();
      }

      if (event === "SIGNED_OUT") {
        setCart(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLanguageMenuOpen && !isAccountMenuOpen && !isSearchOpen && !isCartOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }

      if (
        languageMenuRef.current &&
        !languageMenuRef.current.contains(event.target as Node)
      ) {
        setIsLanguageMenuOpen(false);
      }

      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }

      if (
        cartMenuRef.current &&
        !cartMenuRef.current.contains(event.target as Node)
      ) {
        setIsCartOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsSearchOpen(false);
        setIsLanguageMenuOpen(false);
        setIsAccountMenuOpen(false);
        setIsCartOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLanguageMenuOpen, isAccountMenuOpen, isSearchOpen, isCartOpen]);

  useEffect(() => {
    function handleCartUpdated(event: Event) {
      const detail = (event as CustomEvent<CartUpdatedEventDetail>).detail;

      setCart(detail.cart);
      setIsCartOpen(true);
      runCartFlyAnimation(detail);
    }

    window.addEventListener("novatech:cart-updated", handleCartUpdated);

    return () =>
      window.removeEventListener("novatech:cart-updated", handleCartUpdated);
  }, []);

  useEffect(() => {
    function handleOpenAuth() {
      setIsAuthOpen(true);
    }

    window.addEventListener("novatech:open-auth", handleOpenAuth);

    return () =>
      window.removeEventListener("novatech:open-auth", handleOpenAuth);
  }, []);

  useEffect(() => {
    const normalizedSearchValue = searchValue.trim();

    if (normalizedSearchValue.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);

      fetch(
        `${apiBaseUrl}/catalog/products?q=${encodeURIComponent(
          normalizedSearchValue,
        )}`,
        { signal: controller.signal },
      )
        .then((response) => (response.ok ? response.json() : []))
        .then((products: Product[]) => {
          setSearchSuggestions(products.slice(0, 5));
          setIsSearchOpen(true);
        })
        .catch((error) => {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }

          setSearchSuggestions([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchValue]);

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setCart(null);
    setIsAccountMenuOpen(false);
    setIsCartOpen(false);
  }

  function handleToggleTheme() {
    const nextTheme: ThemeMode = theme === "dark" ? "light" : "dark";

    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("novatech-theme", nextTheme);
    setTheme(nextTheme);
  }

  async function refreshCart() {
    setIsCartLoading(true);

    try {
      setCart(await getCart());
    } catch {
      setCart(null);
    } finally {
      setIsCartLoading(false);
    }
  }

  function runCartFlyAnimation(detail: CartUpdatedEventDetail) {
    const targetRect = cartButtonRef.current?.getBoundingClientRect();

    if (!targetRect) {
      return;
    }

    const nextItem: FlyingCartItem = {
      id: Date.now(),
      productBrand: detail.productBrand,
      productName: detail.productName,
      from: detail.sourceRect,
      to: {
        x: targetRect.left + targetRect.width / 2,
        y: targetRect.top + targetRect.height / 2,
      },
      isActive: false,
    };

    setFlyingCartItem(nextItem);

    window.requestAnimationFrame(() => {
      setFlyingCartItem((current) =>
        current?.id === nextItem.id ? { ...current, isActive: true } : current,
      );
    });

    window.setTimeout(() => {
      setFlyingCartItem((current) =>
        current?.id === nextItem.id ? null : current,
      );
    }, 760);
  }

  async function handleRemoveCartItem(itemId: string) {
    setPendingCartItemId(itemId);

    try {
      setCart(await removeCartItem(itemId));
    } finally {
      setPendingCartItemId(null);
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedSearchValue = searchValue.trim();
    const searchParams = new URLSearchParams();

    searchParams.set("lang", locale);

    if (normalizedSearchValue) {
      searchParams.set("q", normalizedSearchValue);
    }

    window.location.href = `/products?${searchParams.toString()}`;
  }

  const userAvatarUrl = getUserAvatarUrl(user);
  const userDisplayName =
    getUserDisplayName(user) ?? user?.email ?? dictionary.ui.account.fallbackName;

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-amber-500/20 bg-[#2f1d14] shadow-sm shadow-stone-950/10">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/?lang=${locale}`}
            className="flex items-center"
          >
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
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`${item.href}?lang=${locale}`}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
                  pathname === item.href
                    ? "bg-amber-400 text-stone-950 shadow-sm"
                    : "text-amber-100/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                {dictionary.nav[item.key]}
              </Link>
            ))}
          </nav>

          <form
            ref={searchRef}
            action="/"
            onSubmit={handleSearchSubmit}
            className="relative mx-3 hidden min-w-48 max-w-md flex-1 items-center rounded-md border border-amber-200/25 bg-white/10 px-3 text-amber-50 transition focus-within:border-amber-100 focus-within:bg-white/15 sm:flex"
          >
            <Search className="h-4 w-4 shrink-0 text-amber-100/80" aria-hidden="true" />
            <input
              name="q"
              type="search"
              value={searchValue}
              onChange={(event) => {
                const nextValue = event.target.value;

                setSearchValue(nextValue);

                if (nextValue.trim().length < 2) {
                  setSearchSuggestions([]);
                  setIsSearching(false);
                  setIsSearchOpen(false);
                }
              }}
              onFocus={() => {
                if (searchValue.trim().length >= 2) {
                  setIsSearchOpen(true);
                }
              }}
              placeholder={dictionary.ui.search.placeholder}
              className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-amber-50 outline-none placeholder:text-amber-100/60"
            />
            <input type="hidden" name="lang" value={locale} />

            {isSearchOpen && searchValue.trim().length >= 2 ? (
              <div className="absolute left-0 right-0 top-12 z-20 overflow-hidden rounded-lg border border-amber-900/10 bg-[#fffaf2] py-2 text-stone-800 shadow-xl shadow-stone-950/20">
                {isSearching ? (
                  <SearchDropdownSkeleton label={dictionary.ui.search.loading} />
                ) : searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map((product) => (
                      <a
                        key={product.id}
                        href={`/products?q=${encodeURIComponent(
                          product.name,
                        )}&lang=${locale}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 transition hover:bg-amber-100/70"
                      >
                        <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md bg-amber-100 text-xs font-bold text-amber-900">
                          {getSearchSuggestionImageUrl(product) ? (
                            <img
                              src={getSearchSuggestionImageUrl(product) ?? ""}
                              alt={product.name}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            product.brand.slice(0, 2).toUpperCase()
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-stone-950">
                            {product.name}
                          </span>
                          <span className="mt-1 block text-xs font-semibold text-amber-800">
                            {formatCurrency(product.price)}
                          </span>
                        </span>
                      </a>
                    ))}

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center border-t border-amber-900/10 px-4 py-3 text-sm font-semibold text-stone-700 transition hover:bg-amber-100/70 hover:text-amber-900"
                    >
                      {dictionary.ui.search.viewAll}
                    </button>
                  </>
                ) : (
                  <p className="px-4 py-3 text-sm font-semibold text-stone-500">
                    {dictionary.ui.search.empty}
                  </p>
                )}
              </div>
            ) : null}
          </form>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              aria-label={theme === "dark" ? "Bật theme sáng" : "Bật theme tối"}
              onClick={handleToggleTheme}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/30 bg-white/10 text-amber-50 transition hover:border-amber-100 hover:bg-white/15"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
            </button>

            <div ref={languageMenuRef} className="relative">
              <button
                type="button"
                aria-label="Language"
                aria-expanded={isLanguageMenuOpen}
                onClick={() => {
                  setIsLanguageMenuOpen((current) => !current);
                  setIsAccountMenuOpen(false);
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-amber-200/30 bg-white/10 transition hover:border-amber-100 hover:bg-white/15"
              >
                <span
                  className={`fi fi-${localeOptions[locale].flagCode} rounded-sm text-lg`}
                  aria-hidden="true"
                />
              </button>

              {isLanguageMenuOpen ? (
                <div className="absolute right-0 top-12 w-48 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-amber-900/10 bg-[#fffaf2] py-2 text-stone-800 shadow-xl shadow-stone-950/20">
                  {locales.map((item) => (
                    <a
                      key={item}
                      href={`?lang=${item}`}
                      aria-current={locale === item ? "true" : undefined}
                      onClick={() => setIsLanguageMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold transition ${
                        locale === item
                          ? "bg-amber-100 text-amber-950"
                          : "hover:bg-amber-100/70"
                      }`}
                    >
                      <span
                        className={`fi fi-${localeOptions[item].flagCode} rounded-sm text-lg`}
                        aria-hidden="true"
                      />
                      {localeOptions[item].label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
            {user ? (
              <div ref={accountMenuRef} className="relative">
                <button
                  type="button"
                  aria-label={dictionary.ui.account.aria}
                  aria-expanded={isAccountMenuOpen}
                  onClick={() => {
                    setIsAccountMenuOpen((current) => !current);
                    setIsLanguageMenuOpen(false);
                    setIsCartOpen(false);
                  }}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:border-amber-100 hover:bg-white/10 ${
                    pathname === "/account"
                      ? "border-amber-100 bg-white/15 text-white"
                      : "border-amber-200/30 text-amber-50"
                  }`}
                >
                  {userAvatarUrl ? (
                    <span
                      className="h-8 w-8 rounded-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${userAvatarUrl})` }}
                      aria-hidden="true"
                    />
                  ) : (
                    <UserCircle className="h-5 w-5" aria-hidden="true" />
                  )}
                </button>

                {isAccountMenuOpen ? (
                  <div className="absolute right-0 top-12 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-amber-900/10 bg-[#fffaf2] py-2 text-stone-800 shadow-xl shadow-stone-950/20">
                    <div className="flex items-center gap-3 border-b border-amber-900/10 px-4 py-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-amber-100 text-amber-900">
                        {userAvatarUrl ? (
                          <span
                            className="h-full w-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${userAvatarUrl})` }}
                            aria-hidden="true"
                          />
                        ) : (
                          <UserCircle className="h-5 w-5" aria-hidden="true" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-stone-950">
                          {userDisplayName}
                        </span>
                        {user.email ? (
                          <span className="mt-1 block truncate text-xs text-stone-500">
                            {user.email}
                          </span>
                        ) : null}
                      </span>
                    </div>

                    <Link
                      href="/account"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-amber-100/70"
                    >
                      <User className="h-4 w-4 text-amber-800" aria-hidden="true" />
                      {dictionary.ui.account.profile}
                    </Link>

                    <Link
                      href="/cart"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-amber-100/70"
                    >
                      <ShoppingCart className="h-4 w-4 text-amber-800" aria-hidden="true" />
                      {dictionary.ui.account.cartOrders}
                    </Link>

                    <Link
                      href="/account/wishlist"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-semibold transition hover:bg-amber-100/70"
                    >
                      <Heart className="h-4 w-4 text-amber-800" aria-hidden="true" />
                      {dictionary.ui.account.wishlist.title}
                    </Link>

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      {dictionary.ui.account.signOut}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <button
                type="button"
                aria-label={dictionary.nav.signIn}
                onClick={() => setIsAuthOpen(true)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition hover:border-amber-100 hover:bg-white/10 ${
                  pathname === "/account"
                    ? "border-amber-100 bg-white/15 text-white"
                    : "border-amber-200/30 text-amber-50"
                }`}
              >
                <User className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
            <div ref={cartMenuRef} className="relative">
              <button
                ref={cartButtonRef}
                type="button"
                aria-label={dictionary.nav.cart}
                aria-expanded={isCartOpen}
                onClick={() => {
                  if (!user) {
                    setIsAuthOpen(true);
                    return;
                  }

                  setIsCartOpen((current) => !current);
                  setIsLanguageMenuOpen(false);
                  setIsAccountMenuOpen(false);
                  void refreshCart();
                }}
                className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full transition ${
                  pathname === "/cart"
                    ? "bg-white text-amber-900"
                    : "bg-amber-400 text-stone-950 hover:bg-amber-300"
                }`}
              >
                <ShoppingCart className="h-4 w-4" aria-hidden="true" />
                {cart?.totalQuantity ? (
                  <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                    {cart.totalQuantity}
                  </span>
                ) : null}
              </button>

              {isCartOpen ? (
                <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-amber-900/10 bg-[#fffaf2] text-stone-800 shadow-xl shadow-stone-950/20 sm:w-80">
                  <div className="flex items-center justify-between border-b border-amber-900/10 px-4 py-3">
                    <p className="text-sm font-semibold text-stone-950">
                      {dictionary.nav.cart}
                    </p>
                    <span className="text-xs font-semibold text-stone-500">
                      {cart?.totalQuantity ?? 0} {dictionary.ui.cart.itemCount}
                    </span>
                  </div>

                  {isCartLoading ? (
                    <CartDropdownSkeleton />
                  ) : cart && cart.items.length > 0 ? (
                    <>
                      <div className="max-h-[55vh] overflow-y-auto py-2 sm:max-h-80">
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-3 px-4 py-3 transition hover:bg-amber-100/70"
                          >
                            <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-md bg-amber-100 text-xs font-bold text-amber-900">
                              {item.variant.imageUrl ?? item.product.thumbnailUrl ? (
                                <img
                                  src={
                                    item.variant.imageUrl ??
                                    item.product.thumbnailUrl ??
                                    ""
                                  }
                                  alt={item.variant.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                item.product.name.slice(0, 2).toUpperCase()
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-stone-950">
                                {item.product.name}
                              </span>
                              <span className="mt-1 block truncate text-xs font-semibold text-stone-500">
                                {item.variant.name} x {item.quantity}
                              </span>
                              <span className="mt-1 block text-xs font-semibold text-amber-800">
                                {formatCurrency(item.variant.price * item.quantity)}
                              </span>
                            </span>
                            <button
                              type="button"
                              aria-label={dictionary.ui.cart.removeItem}
                              disabled={pendingCartItemId !== null}
                              onClick={() => void handleRemoveCartItem(item.id)}
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" aria-hidden="true" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-amber-900/10 px-4 py-3">
                        <div className="flex items-center justify-between text-sm font-semibold">
                          <span>{dictionary.ui.cart.subtotal}</span>
                          <span>{formatCurrency(cart.subtotal)}</span>
                        </div>
                        <Link
                          href="/cart"
                          onClick={() => setIsCartOpen(false)}
                          className="mt-3 flex h-10 w-full items-center justify-center rounded-md border border-amber-900/15 text-sm font-semibold text-stone-700 transition hover:border-amber-700 hover:text-amber-800"
                        >
                          {dictionary.ui.cart.detail}
                        </Link>
                        <Link
                          href="/checkout"
                          onClick={() => setIsCartOpen(false)}
                          className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-amber-700 text-sm font-semibold text-white transition hover:bg-amber-800"
                        >
                          {dictionary.ui.cart.checkout}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="px-4 py-5 text-sm font-semibold text-stone-500">
                      {dictionary.ui.cart.empty}
                    </p>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl gap-3 px-4 pb-3 sm:hidden">
          <form
            action="/"
            onSubmit={handleSearchSubmit}
            className="relative flex items-center rounded-full border border-amber-200/25 bg-white/10 px-3 text-amber-50 transition focus-within:border-amber-100 focus-within:bg-white/15"
          >
            <Search className="h-4 w-4 shrink-0 text-amber-100/80" aria-hidden="true" />
            <input
              name="q"
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder={dictionary.ui.search.placeholder}
              className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-amber-50 outline-none placeholder:text-amber-100/60"
            />
            <input type="hidden" name="lang" value={locale} />
          </form>

          <nav className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={`${item.href}?lang=${locale}`}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`inline-flex h-9 shrink-0 items-center rounded-full px-3 text-sm font-semibold transition ${
                  pathname === item.href
                    ? "bg-amber-400 text-stone-950 shadow-sm"
                    : "bg-white/10 text-amber-100 hover:bg-white/15 hover:text-white"
                }`}
              >
                {dictionary.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {flyingCartItem ? (
        <div
          className="pointer-events-none fixed z-[60] grid h-14 w-14 place-items-center rounded-lg border border-amber-900/10 bg-[#fffaf2] text-xs font-bold uppercase text-amber-900 shadow-2xl transition-all duration-700 ease-in-out"
          style={{
            left: flyingCartItem.isActive
              ? flyingCartItem.to.x - 28
              : flyingCartItem.from.x - 28,
            top: flyingCartItem.isActive
              ? flyingCartItem.to.y - 28
              : flyingCartItem.from.y - 28,
            opacity: flyingCartItem.isActive ? 0.15 : 1,
            transform: flyingCartItem.isActive
              ? "scale(0.35) rotate(12deg)"
              : "scale(1) rotate(0deg)",
          }}
          title={flyingCartItem.productName}
        >
          {flyingCartItem.productBrand.slice(0, 3)}
        </div>
      ) : null}

      <AuthModal
        dictionary={dictionary}
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}

function CartDropdownSkeleton() {
  return (
    <div aria-busy="true" className="animate-pulse py-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-4 py-3">
          <span className="h-12 w-12 shrink-0 rounded-md bg-amber-100" />
          <span className="min-w-0 flex-1">
            <span className="block h-4 w-4/5 rounded bg-stone-200" />
            <span className="mt-2 block h-3 w-2/3 rounded bg-stone-100" />
            <span className="mt-2 block h-3 w-20 rounded bg-amber-100" />
          </span>
          <span className="h-9 w-9 shrink-0 rounded-full bg-stone-100" />
        </div>
      ))}
      <div className="border-t border-amber-900/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="h-4 w-16 rounded bg-stone-100" />
          <span className="h-4 w-24 rounded bg-stone-200" />
        </div>
        <div className="mt-3 h-10 rounded-md bg-stone-100" />
        <div className="mt-2 h-10 rounded-md bg-amber-200/80" />
      </div>
    </div>
  );
}

function SearchDropdownSkeleton({ label }: { label: string }) {
  return (
    <div aria-busy="true" className="animate-pulse py-2">
      <span className="sr-only">{label}</span>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3">
          <span className="h-11 w-11 shrink-0 rounded-md bg-amber-100" />
          <span className="min-w-0 flex-1">
            <span className="block h-4 w-4/5 rounded bg-stone-200" />
            <span className="mt-2 block h-3 w-24 rounded bg-amber-100" />
          </span>
        </div>
      ))}
    </div>
  );
}

function getUserAvatarUrl(user: SupabaseUser | null) {
  const avatarUrl = user?.user_metadata?.avatar_url;
  const picture = user?.user_metadata?.picture;

  if (typeof avatarUrl === "string" && avatarUrl.trim()) {
    return avatarUrl;
  }

  if (typeof picture === "string" && picture.trim()) {
    return picture;
  }

  return null;
}

function getUserDisplayName(user: SupabaseUser | null) {
  const fullName = user?.user_metadata?.full_name;
  const name = user?.user_metadata?.name;

  if (typeof fullName === "string" && fullName.trim()) {
    return fullName;
  }

  if (typeof name === "string" && name.trim()) {
    return name;
  }

  return null;
}

function getSearchSuggestionImageUrl(product: Product) {
  return (
    product.variants.find((variant) => variant.images[0]?.imageUrl)?.images[0]
      ?.imageUrl ||
    product.imageUrl ||
    null
  );
}
