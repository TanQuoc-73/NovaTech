"use client";

import { usePathname } from "next/navigation";
import { ChatWidget } from "./chat-widget";

export function ChatWidgetWrapper() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/staff")) {
    return null;
  }

  return <ChatWidget />;
}
