// Reads a due date typed in words: "tomorrow", "24h", "7 days", "fri", "Feb 9",
// "2026-02-09". Answers a day as YYYY-MM-DD, or null when it cannot tell.

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

/** A local day as YYYY-MM-DD. */
export const day = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const plus = (from: Date, days: number) =>
  new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);

export function parseDue(text: string, now: Date = new Date()): string | null {
  const words = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!words) return null;
  if (words === "today") return day(now);
  if (words === "tomorrow") return day(plus(now, 1));

  // 24h, 7 days, 2w, 3 weeks
  const span = /^(?:in )?(\d{1,3}) ?(h|hours?|d|days?|w|weeks?)$/.exec(words);
  if (span) {
    const n = Number(span[1]);
    const unit = (span[2] as string)[0];
    if (unit === "h") return day(new Date(now.getTime() + n * 3_600_000));
    return day(plus(now, unit === "w" ? n * 7 : n));
  }

  // A weekday: the next one, never today.
  const weekday = DAYS.findIndex((d) => words.length >= 3 && d.startsWith(words));
  if (weekday >= 0) return day(plus(now, (weekday - now.getDay() + 7) % 7 || 7));

  // 2026-02-09
  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(words);
  if (iso) return valid(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  // Feb 9, 9 Feb, February 9: this year, or next when that day has passed.
  const named =
    /^([a-z]{3,9})\.? (\d{1,2})(?:st|nd|rd|th)?$/.exec(words) ??
    /^(\d{1,2})(?:st|nd|rd|th)? ([a-z]{3,9})\.?$/.exec(words);
  if (named) {
    const [a, b] = [named[1] as string, named[2] as string];
    const name = /^\d/.test(a) ? b : a;
    const date = Number(/^\d/.test(a) ? a : b);
    const month = MONTHS.findIndex((m) => name.startsWith(m));
    if (month < 0) return null;
    const year = now.getFullYear();
    const first = valid(year, month, date);
    return first !== null && first < day(now) ? valid(year + 1, month, date) : first;
  }
  return null;
}

/** The day, when the three numbers name a real one. */
function valid(year: number, month: number, date: number): string | null {
  const made = new Date(year, month, date);
  return made.getFullYear() === year && made.getMonth() === month && made.getDate() === date
    ? day(made)
    : null;
}

/** The Friday of the week `now` is in; the next Friday when it is already the weekend. */
export const endOfWeek = (now: Date = new Date()): string =>
  day(plus(now, (5 - now.getDay() + 7) % 7));
