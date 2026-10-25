// Weeks run Monday to Sunday in Chicago time (where this app's users are), using plain YYYY-MM-DD dates.
const TIME_ZONE = "America/Chicago";
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const toDate = (ymd: string) => new Date(`${ymd}T12:00:00Z`);
const toYmd = (d: Date) => d.toISOString().slice(0, 10);

export function todayInChicago() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(
    new Date(),
  );
}

export function addDays(ymd: string, days: number) {
  const d = toDate(ymd);
  d.setUTCDate(d.getUTCDate() + days);
  return toYmd(d);
}

export function mondayOf(ymd: string) {
  const day = toDate(ymd).getUTCDay(); // 0 = Sunday
  return addDays(ymd, -((day + 6) % 7));
}

// The week to show: ?week=YYYY-MM-DD (any day in it), else this week.
export function resolveWeek(param: string | string[] | undefined) {
  const picked =
    typeof param === "string" && DATE.test(param) ? param : todayInChicago();
  const start = mondayOf(picked);
  return {
    start,
    end: addDays(start, 6),
    isCurrent: start === mondayOf(todayInChicago()),
  };
}

export function weekLabel(start: string, end: string) {
  const fmt = (ymd: string, opts: Intl.DateTimeFormatOptions) =>
    toDate(ymd).toLocaleDateString("en-US", { timeZone: "UTC", ...opts });
  return `${fmt(start, { month: "short", day: "numeric" })} – ${fmt(end, { month: "short", day: "numeric" })}`;
}
