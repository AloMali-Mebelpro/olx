import type { Metadata } from "next";
import { Geist, Geist_Mono, Vazirmatn } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AdSlot from "@/components/AdSlot";
import { getServerDictionary } from "@/lib/i18n/server";
import { localeMeta } from "@/lib/i18n/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "HinOi — доска объявлений",
  description: "Платформа для размещения объявлений о продаже товаров",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { locale, dict } = await getServerDictionary();
  const dir = localeMeta[locale].dir;

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${vazirmatn.variable} h-full antialiased`}
    >
      <body
        className={`flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 ${
          locale === "prs" ? "font-[family-name:var(--font-vazirmatn)]" : ""
        }`}
      >
        <Header />
        <div className="mx-auto w-full max-w-7xl px-4 pt-3">
          <AdSlot position="BANNER_TOP" />
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4">
          {children}
        </main>
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          © {new Date().getFullYear()} {dict.footer.copyright}{" "}
          <a href="/admin/ads" className="underline hover:text-emerald-600">
            {dict.footer.adminLink}
          </a>
        </footer>
      </body>
    </html>
  );
}
