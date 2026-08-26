"use client";

import { useEffect, useState } from "react";
import { defaultLocale, isLocale, localeCookieName, type Locale } from "./config";
import { dictionaries, getDictionary } from "./dictionaries";

function readCookieLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${localeCookieName}=([^;]*)`)
  );
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return isLocale(value) ? value : defaultLocale;
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
  window.dispatchEvent(new Event("locale-changed"));
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocale(readCookieLocale());
    const handler = () => setLocale(readCookieLocale());
    window.addEventListener("locale-changed", handler);
    return () => window.removeEventListener("locale-changed", handler);
  }, []);

  return { locale, dict: getDictionary(locale) };
}

export { dictionaries };
