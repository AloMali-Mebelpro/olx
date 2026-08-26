const STORAGE_KEY = "favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event("favorites-changed"));
}

export function getFavorites(): string[] {
  return readFavorites();
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}

export function toggleFavorite(id: string): boolean {
  const current = readFavorites();
  const exists = current.includes(id);
  const next = exists ? current.filter((f) => f !== id) : [...current, id];
  writeFavorites(next);
  return !exists;
}
