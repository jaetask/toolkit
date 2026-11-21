const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

export const day = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const plus = (from: Date, days: number) =>
  new Date(from.getFullYear(), from.getMonth(), from.getDate() + days);

export function parseDue(text: string, now: Date = new Date()): string | null {
  const words = text.trim().toLowerCase().replace(/\s+/g, " ");
  if (!words) return null;
  if (words === "today") return day(now);
  if (words === "tomorrow") return day(plus(now, 1));

  const span = /^(?:in )?(\d{1,3}) ?(h|hours?|d|days?|w|weeks?)$/.exec(words);
  if (span) {
    const n = Number(span[1]);
    const unit = (span[2] as string)[0];
    if (unit === "h") return day(new Date(now.getTime() + n * 3_600_000));
    return day(plus(now, unit === "w" ? n * 7 : n));
  }

  const weekday = DAYS.findIndex((d) => words.length >= 3 && d.startsWith(words));
  if (weekday >= 0) return day(plus(now, (weekday - now.getDay() + 7) % 7 || 7));

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(words);
  if (iso) return valid(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

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

function valid(year: number, month: number, date: number): string | null {
  const made = new Date(year, month, date);
  return made.getFullYear() === year && made.getMonth() === month && made.getDate() === date
    ? day(made)
    : null;
}

export const endOfWeek = (now: Date = new Date()): string =>
  day(plus(now, (5 - now.getDay() + 7) % 7));
