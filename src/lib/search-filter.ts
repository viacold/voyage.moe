import type { SearchEntry } from "./search";

export function searchEntries(entries: SearchEntry[], query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return entries.slice(0, 8);
  }

  return entries.filter((entry) => entry.text.includes(normalized));
}
