import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaTech",
  description: "Cua hang cong nghe cho laptop, smartphone va phu kien thong minh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
