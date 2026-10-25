import Link from "next/link";
import { card, focusRing, label } from "@/components/styles";
import { Sparkline } from "@/components/Sparkline";
import {
  formatValue,
  shortDate,
  unit,
  type ExerciseProgress,
} from "@/lib/progress";

const RECENT = 12;

// Change since the first of the recent sessions. Up is shown in green with ▲; down is not "bad"
// (deloads are normal), so it stays muted with ▼. Symbol and words always carry the meaning.
function Change({ p }: { p: ExerciseProgress }) {
  const recent = p.sessions.slice(-RECENT);
  if (recent.length < 2)
    return <span className="text-sm text-ls-muted">First session</span>;
  const delta = recent.at(-1)!.value - recent[0].value;
  const amount = `${Number.isInteger(delta) ? Math.abs(delta) : Math.abs(delta).toFixed(1)} ${unit(p.mode)}`;
  const since = `since ${shortDate(recent[0].date)}`;
  if (delta > 0)
    return (
      <span className="text-sm text-ls-success">
        ▲ +{amount} <span className="text-ls-muted">{since}</span>
      </span>
    );
  if (delta < 0)
    return (
      <span className="text-sm text-ls-muted">
        ▼ −{amount} {since}
      </span>
    );
  return <span className="text-sm text-ls-muted">No change {since}</span>;
}

export function ExerciseList({ exercises }: { exercises: ExerciseProgress[] }) {
  if (!exercises.length) {
    return (
      <p className="border border-dashed border-ls-border p-6 text-center text-ls-muted">
        Exercises you log will show up here with their trend.
      </p>
    );
  }
  return (
    <ul className={`divide-y divide-ls-border ${card}`}>
      {exercises.map((p) => {
        const latest = p.sessions.at(-1)!;
        return (
          <li key={p.exerciseId}>
            <Link
              href={`/progress/${p.exerciseId}`}
              className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-ls-ink/[0.04] ${focusRing} focus-visible:outline-offset-[-2px]`}
            >
              <span className="min-w-0 flex-1">
                <span className={`${label} block`}>{p.category}</span>
                <span className="block truncate font-ls-serif text-[22px] leading-tight">
                  {p.name}
                </span>
                <span className="block">
                  <span className="mr-2 font-medium">
                    {formatValue(latest.value, p.mode)}
                  </span>
                  <Change p={p} />
                </span>
              </span>
              <Sparkline
                values={p.sessions.slice(-RECENT).map((s) => s.value)}
              />
              <span aria-hidden className="text-ls-muted">
                →
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
