"use client";

import { useState } from "react";
import { focusRing, quiet } from "@/components/styles";
import {
  countByCategory,
  countByMuscle,
  type Count,
  type WeekSet,
} from "@/lib/volume";

// Round the axis up to a clean number so the gridlines land on 0, 5, 10, ...
const niceMax = (counts: Count[]) =>
  Math.max(10, Math.ceil(Math.max(...counts.map((c) => c.sets), 0) / 5) * 5);

function Bars({
  counts,
  onPick,
  picked,
  caption,
}: {
  counts: Count[];
  onPick?: (name: string) => void;
  picked?: string | null;
  caption: string;
}) {
  const max = niceMax(counts);
  const ticks = Array.from({ length: max / 5 + 1 }, (_, i) => i * 5);

  return (
    <figure>
      <figcaption className="sr-only">{caption}</figcaption>
      <div className="grid grid-cols-[6.5rem_1fr] items-center gap-x-3">
        {counts.map((c) => {
          const width = `${(c.sets / max) * 100}%`;
          const content = (
            <>
              <span className="truncate text-left text-[15px]">{c.name}</span>
              <span className="relative flex h-11 items-center">
                {/* Recessive 1px gridlines at each tick */}
                {ticks.map((t) => (
                  <span
                    key={t}
                    aria-hidden
                    className="absolute inset-y-0 w-px bg-ls-rule/40"
                    style={{ left: `${(t / max) * 100}%` }}
                  />
                ))}
                {/* Bar: ink, 20px thick, square at the baseline, 4px rounded tip */}
                {c.sets > 0 && (
                  <span
                    aria-hidden
                    className="relative h-5 rounded-r-[4px] bg-ls-ink transition-opacity group-hover:opacity-80"
                    style={{ width }}
                  />
                )}
                <span className="relative ml-2 text-[15px] font-medium tabular-nums">
                  {c.sets === 0 ? (
                    <span className="text-ls-muted">0</span>
                  ) : (
                    c.sets
                  )}
                </span>
              </span>
            </>
          );
          return onPick ? (
            <button
              key={c.name}
              type="button"
              onClick={() => onPick(c.name)}
              aria-pressed={picked === c.name}
              aria-label={`${c.name}: ${c.sets} ${c.sets === 1 ? "set" : "sets"}. Show muscles.`}
              className={`group col-span-2 grid cursor-pointer grid-cols-subgrid items-center px-1 transition-colors hover:bg-ls-ink/[0.04] aria-pressed:bg-ls-ink/[0.07] ${focusRing}`}
            >
              {content}
            </button>
          ) : (
            <div
              key={c.name}
              className="col-span-2 grid grid-cols-subgrid items-center px-1"
            >
              {content}
            </div>
          );
        })}
      </div>
      {/* Axis ticks, aligned with the bar track */}
      <div className="grid grid-cols-[6.5rem_1fr] gap-x-3 px-1" aria-hidden>
        <span />
        <span className="relative h-5 text-xs text-ls-muted tabular-nums">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2"
              style={{ left: `${(t / max) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </span>
      </div>
    </figure>
  );
}

export function VolumeChart({ sets }: { sets: WeekSet[] }) {
  const [picked, setPicked] = useState<string | null>(null);
  const byCategory = countByCategory(sets);
  const muscles = picked ? countByMuscle(sets, picked) : [];

  return (
    <div className="flex flex-col gap-6">
      <Bars
        counts={byCategory}
        picked={picked}
        onPick={(name) => setPicked(picked === name ? null : name)}
        caption="Sets per muscle group this week"
      />
      <p className="text-sm text-ls-muted">
        Tap a muscle group to see which muscles did the work.
      </p>

      {picked && (
        <section aria-live="polite" className="border-t border-ls-ink pt-4">
          <div className="mb-2 flex items-baseline justify-between">
            <h3 className="font-ls-serif text-[26px] leading-tight">
              {picked}, by muscle
            </h3>
            <button
              type="button"
              onClick={() => setPicked(null)}
              className={quiet}
            >
              Close
            </button>
          </div>
          {muscles.length ? (
            <>
              <Bars
                counts={muscles}
                caption={`Sets per muscle in ${picked} this week`}
              />
              <p className="mt-2 text-sm text-ls-muted">
                A set counts once for each main muscle it works, so these can
                add up to more than the {picked} total.
              </p>
            </>
          ) : (
            <p className="text-ls-muted">
              No {picked.toLowerCase()} sets this week.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
