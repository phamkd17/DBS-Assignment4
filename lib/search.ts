// Ranks exercise names for a search box: exact match, then starts-with, then a word starts with it,
// then contains it anywhere. Shorter names win ties, since the plain version of a lift has the shortest name.
// Multi-word searches ("db row") match when every word appears somewhere in the name.
export function rankByName<T extends { name: string }>(items: T[], query: string): T[] {
  const q = normalize(query);
  if (!q) return items;
  const words = q.split(" ");

  const scored: { item: T; score: number }[] = [];
  for (const item of items) {
    const name = normalize(item.name);
    if (!words.every((w) => name.includes(w))) continue;
    const score = name === q ? 0 : name.startsWith(q) ? 1 : new RegExp(`\\b${escape(q)}`).test(name) ? 2 : 3;
    scored.push({ item, score });
  }
  return scored
    .sort((a, b) => a.score - b.score || a.item.name.length - b.item.name.length || a.item.name.localeCompare(b.item.name))
    .map((s) => s.item);
}

// "Pull-ups" and "pull ups" should match the same way.
const normalize = (s: string) => s.toLowerCase().replace(/[-–_]/g, " ").replace(/\s+/g, " ").trim();
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
