"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getDictionary, resolveLocale, type Dictionary } from "@/shared/i18n";
import { ChatWidget } from "./chat-widget";

export function ChatWidgetWrapper() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);

  useEffect(() => {
    const locale = resolveLocale(searchParams?.get("lang") ?? undefined);
    setDictionary(getDictionary(locale));
  }, [searchParams]);

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/staff")) {
    return null;
  }

  if (!dictionary) return null;

  return <ChatWidget dictionary={dictionary} />;
}
