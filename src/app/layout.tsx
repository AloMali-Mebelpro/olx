import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AdSlot from "@/components/AdSlot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Объявления — доска объявлений",
  description: "Платформа для размещения объявлений о продаже товаров",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Header />
        <div className="mx-auto w-full max-w-7xl px-4 pt-3">
          <AdSlot position="BANNER_TOP" />
        </div>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4">
          {children}
        </main>
        <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          © {new Date().getFullYear()} Объявления. Учебный проект.{" "}
          <a href="/admin/ads" className="underline hover:text-emerald-600">
            Управление рекламой
          </a>
        </footer>
      </body>
    </html>
  );
}
