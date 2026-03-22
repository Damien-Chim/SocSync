/** When a scraped / human date has no year, assume this year (e.g. "25 March"). */
export const DEFAULT_EVENT_YEAR = 2026;

/**
 * Normalize Postgres DATE / ISO strings to YYYY-MM-DD for comparisons.
 */
export function normalizeDbDate(value: unknown): string {
  if (value == null || value === "") {
    return `${DEFAULT_EVENT_YEAR}-01-01`;
  }
  const s = String(value);
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) {
    const [year, month, day] = m[1].split("-");
    const normalizedYear =
      parseInt(year, 10) < DEFAULT_EVENT_YEAR ? String(DEFAULT_EVENT_YEAR) : year;
    return `${normalizedYear}-${month}-${day}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    let y = d.getFullYear();
    if (y < DEFAULT_EVENT_YEAR) y = DEFAULT_EVENT_YEAR;
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  }
  return `${DEFAULT_EVENT_YEAR}-01-01`;
}

/**
 * Normalize Postgres TIME ("HH:MM:SS", "HH:MM:SS+00", etc.) to HH:MM.
 */
export function normalizeDbTime(value: unknown): string {
  if (value == null || value === "") return "00:00";
  const s = String(value);
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return "00:00";
  const hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  const mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Event instant in the user's local timezone (avoids ISO parsing quirks).
 */
export function getEventLocalMs(dateStr: string, timeStr: string): number {
  const date = normalizeDbDate(dateStr);
  const time = normalizeDbTime(timeStr);
  const [y, mo, d] = date.split("-").map((x) => parseInt(x, 10));
  if (!y || !mo || !d) return Number.NaN;
  const [hh, mm] = time.split(":").map((x) => parseInt(x, 10));
  return new Date(y, mo - 1, d, hh || 0, mm || 0, 0, 0).getTime();
}

export function getEventLocalDateMs(dateStr: string): number {
  const date = normalizeDbDate(dateStr);
  const [y, mo, d] = date.split("-").map((x) => parseInt(x, 10));
  if (!y || !mo || !d) return Number.NaN;
  return new Date(y, mo - 1, d, 0, 0, 0, 0).getTime();
}
