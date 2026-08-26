// Lightweight fuzzy/partial-match search so users find listings even with
// incomplete titles or minor typos, without needing a full-text search engine.

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/**
 * Scores how well `query` matches the given text fields. Returns 0 when
 * there's no match at all. Full substring hits score higher than partial
 * (prefix-only) hits, so exact matches still sort first.
 */
export function matchScore(query: string, ...fields: (string | null | undefined)[]): number {
  const q = normalize(query);
  if (!q) return 0;

  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 0;

  const haystack = normalize(fields.filter(Boolean).join(" "));
  const words = haystack.split(/\s+/).filter(Boolean);

  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += token.length;
    } else if (words.some((w) => w.startsWith(token) || token.startsWith(w))) {
      score += token.length * 0.5;
    }
  }

  return score;
}

export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
