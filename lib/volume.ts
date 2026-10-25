// Turns a week's sets into counts per category and per muscle, plus plain-language balance notes.

export const CATEGORIES = [
  "Chest",
  "Back",
  "Shoulders",
  "Arms",
  "Legs",
  "Calves",
  "Abs",
] as const;

// Opposing groups that should get similar work. Each pair is compared by set count.
const CATEGORY_PAIRS: [string, string][] = [["Chest", "Back"]];
const MUSCLE_PAIRS: [string, string][] = [
  ["Quads", "Hamstrings"],
  ["Biceps", "Triceps"],
];

export type WeekSet = { category: string; muscles: string[] };
export type Count = { name: string; sets: number };
export type Note = { tone: "warn" | "info"; text: string };

export function countByCategory(sets: WeekSet[]): Count[] {
  const counts = new Map<string, number>(CATEGORIES.map((c) => [c, 0]));
  for (const s of sets)
    if (s.category !== "Cardio")
      counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  return [...counts].map(([name, n]) => ({ name, sets: n }));
}

// A set counts once toward each of its primary muscles (a squat counts for quads, hamstrings, and glutes).
export function countByMuscle(sets: WeekSet[], category: string): Count[] {
  const counts = new Map<string, number>();
  for (const s of sets) {
    if (s.category !== category) continue;
    for (const m of s.muscles.length ? s.muscles : ["Unlabeled"])
      counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  return [...counts]
    .map(([name, n]) => ({ name, sets: n }))
    .sort((a, b) => b.sets - a.sets);
}

// "Imbalanced" = one side of a pair has less than half the other's sets, once the bigger side has 4+.
function pairNotes(counts: Count[], pairs: [string, string][]): Note[] {
  const get = (name: string) => counts.find((c) => c.name === name)?.sets ?? 0;
  const notes: Note[] = [];
  for (const [x, y] of pairs) {
    const [hi, lo] = get(x) >= get(y) ? [x, y] : [y, x];
    if (get(hi) >= 4 && get(lo) < get(hi) / 2) {
      notes.push({
        tone: "warn",
        text: `${lo} has ${get(lo)} sets vs. ${get(hi)} for ${hi}. Add some ${lo.toLowerCase()} work to stay balanced.`,
      });
    }
  }
  return notes;
}

export function balanceNotes(sets: WeekSet[]): Note[] {
  const byCategory = countByCategory(sets);
  if (!sets.length) return [];
  const notes = pairNotes(byCategory, CATEGORY_PAIRS);
  const legs = countByMuscle(sets, "Legs");
  const arms = countByMuscle(sets, "Arms");
  notes.push(...pairNotes([...legs, ...arms], MUSCLE_PAIRS));
  const missed = byCategory.filter(
    (c) =>
      c.sets === 0 &&
      ["Chest", "Back", "Shoulders", "Arms", "Legs"].includes(c.name),
  );
  if (missed.length) {
    notes.push({
      tone: "info",
      text: `Not trained yet this week: ${missed.map((m) => m.name).join(", ")}.`,
    });
  }
  return notes;
}
