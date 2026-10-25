"use client";

import { useEffect, useRef, useState } from "react";
import {
  formatSet,
  shortDate,
  type ExerciseProgress,
  type Session,
} from "@/lib/progress";

const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 44 };

// Clean y-axis ticks (e.g. 120, 130, 140) that include the data range.
function niceTicks(min: number, max: number) {
  if (min === max) [min, max] = [min - 5, max + 5];
  const raw = (max - min) / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  return Array.from(
    { length: Math.round((hi - lo) / step) + 1 },
    (_, i) => lo + i * step,
  );
}

export function TrendChart({ progress }: { progress: ExerciseProgress }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const sessions = progress.sessions;
  const values = sessions.map((s) => s.value);
  const ticks = niceTicks(Math.min(...values), Math.max(...values));
  const [lo, hi] = [ticks[0], ticks.at(-1)!];
  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  // Sessions are evenly spaced (it's "each time you trained", not a calendar).
  const x = (i: number) =>
    PAD.left +
    (sessions.length === 1 ? plotW / 2 : (i * plotW) / (sessions.length - 1));
  const y = (v: number) => PAD.top + plotH - ((v - lo) / (hi - lo)) * plotH;
  const tip: Session | null = active === null ? null : sessions[active];

  return (
    <figure ref={wrap} className="relative">
      <figcaption className="sr-only">
        Heaviest set per session for {progress.name}. Every value is also in the
        table below.
      </figcaption>
      <svg
        width={width}
        height={HEIGHT}
        className="block overflow-visible"
        onPointerLeave={() => setActive(null)}
      >
        {/* Recessive hairline grid + y ticks */}
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--color-ls-rule)"
              strokeOpacity={0.5}
            />
            <text
              x={PAD.left - 8}
              y={y(t)}
              dy="0.35em"
              textAnchor="end"
              className="fill-ls-muted text-[11px] tabular-nums"
            >
              {t}
            </text>
          </g>
        ))}
        {/* First and last dates on the x axis */}
        <text
          x={x(0)}
          y={HEIGHT - 6}
          textAnchor={sessions.length === 1 ? "middle" : "start"}
          className="fill-ls-muted text-[11px]"
        >
          {shortDate(sessions[0].date)}
        </text>
        {sessions.length > 1 && (
          <text
            x={x(sessions.length - 1)}
            y={HEIGHT - 6}
            textAnchor="end"
            className="fill-ls-muted text-[11px]"
          >
            {shortDate(sessions.at(-1)!.date)}
          </text>
        )}
        {sessions.length > 1 && (
          <polyline
            points={sessions.map((s, i) => `${x(i)},${y(s.value)}`).join(" ")}
            fill="none"
            stroke="var(--color-ls-ink)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}
        {sessions.map((s, i) => (
          <g
            key={s.workoutId}
            tabIndex={0}
            role="img"
            aria-label={`${shortDate(s.date)}: ${formatSet(s)}`}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onBlur={() => setActive(null)}
            className="cursor-default outline-none"
          >
            {/* Hit area bigger than the dot */}
            <circle cx={x(i)} cy={y(s.value)} r={14} fill="transparent" />
            <circle
              cx={x(i)}
              cy={y(s.value)}
              r={active === i ? 6 : 4}
              fill="var(--color-ls-ink)"
              stroke={
                active === i ? "var(--color-ls-ink)" : "var(--color-ls-surface)"
              }
              strokeWidth={2}
              style={active === i ? { outline: "none" } : undefined}
            />
            {active === i && (
              <circle
                cx={x(i)}
                cy={y(s.value)}
                r={10}
                fill="none"
                stroke="var(--color-ls-ink)"
                strokeOpacity={0.25}
                strokeWidth={2}
              />
            )}
          </g>
        ))}
      </svg>
      {tip && active !== null && (
        <div
          role="status"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full border border-ls-ink bg-ls-surface px-3 py-2 text-sm whitespace-nowrap"
          style={{
            left: Math.min(Math.max(x(active), 70), width - 70),
            top: y(tip.value) - 12,
          }}
        >
          <span className="block font-medium">{formatSet(tip)}</span>
          <span className="block text-ls-muted">{shortDate(tip.date)}</span>
        </div>
      )}
    </figure>
  );
}
