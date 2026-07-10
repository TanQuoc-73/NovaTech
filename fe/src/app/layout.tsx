import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "NovaTech",
  description: "Cửa hàng công nghệ cho laptop, smartphone và phụ kiện thông minh.",
};

const themeScript = `
(() => {
  try {
    const storedTheme = window.localStorage.getItem("novatech-theme");
    const theme = storedTheme === "light" || storedTheme === "dark"
      ? storedTheme
      : "light";
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className="h-full antialiased"
      data-theme="light"
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground">
        <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
