"use client";

import { useRouter } from "next/navigation";
import { locales, localeMeta, type Locale } from "@/lib/i18n/config";
import { setLocaleCookie, useLocale } from "@/lib/i18n/client";

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale } = useLocale();

  function handleChange(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-zinc-300 p-0.5 dark:border-zinc-700">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => handleChange(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
            locale === l
              ? "bg-emerald-600 text-white"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {localeMeta[l].label}
        </button>
      ))}
    </div>
  );
}
