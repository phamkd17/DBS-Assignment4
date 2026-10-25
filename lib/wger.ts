import "server-only";
import { cacheLife } from "next/cache";

const BASE = "https://wger.de/api/v2";
const ENGLISH = 2;

export type Exercise = {
  id: number;
  name: string;
  category: string;
  muscles: string[];
  equipmentIds: number[];
  image: string | null;
  author: string | null;
};

type RawExercise = {
  id: number;
  category: { name: string };
  muscles: { name: string; name_en: string }[];
  equipment: { id: number }[];
  images: { image: string; is_main: boolean }[];
  translations: { language: number; name: string }[];
  license_author: string | null;
};

// The full catalog is ~7 MB across two pages and takes a few seconds, so we fetch it on the server,
// keep only the fields the app uses (~150 KB), and cache the result for a day.
export async function getCatalog(): Promise<Exercise[]> {
  "use cache";
  cacheLife("days");

  const exercises: Exercise[] = [];
  let url: string | null = `${BASE}/exerciseinfo/?limit=500`;
  while (url) {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) throw new Error(`wger responded ${res.status}`);
    const page: { next: string | null; results: RawExercise[] } = await res.json();
    for (const e of page.results) {
      const name = e.translations.find((t) => t.language === ENGLISH)?.name.trim();
      if (!name) continue;
      exercises.push({
        id: e.id,
        name,
        category: e.category.name,
        muscles: e.muscles.map((m) => m.name_en || m.name),
        equipmentIds: e.equipment.map((q) => q.id),
        image: (e.images.find((i) => i.is_main) ?? e.images[0])?.image ?? null,
        author: e.license_author,
      });
    }
    url = page.next;
  }
  return exercises.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getExercise(id: number): Promise<Exercise | undefined> {
  return (await getCatalog()).find((e) => e.id === id);
}
