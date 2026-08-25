export const locales = ["prs", "ru", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "prs";

export const localeCookieName = "hinoi_locale";

export const localeMeta: Record<
  Locale,
  { label: string; dir: "rtl" | "ltr"; intl: string }
> = {
  prs: { label: "دری", dir: "rtl", intl: "fa-AF" },
  ru: { label: "Русский", dir: "ltr", intl: "ru-RU" },
  en: { label: "English", dir: "ltr", intl: "en-US" },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
