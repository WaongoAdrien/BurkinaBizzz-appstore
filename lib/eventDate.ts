// lib/eventDate.ts — parse/format event dates stored as ISO "YYYY-MM-DD" strings

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

// Returns null for anything that isn't a valid ISO date — including legacy free-text
// values like "12 septembre 2026" entered before the date picker existed.
export function parseEventDate(value?: string): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const year = parseInt(m[1], 10), month = parseInt(m[2], 10) - 1, day = parseInt(m[3], 10);
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return d;
}

// Falls back to the raw string for legacy free-text dates that don't parse.
export function formatEventDate(value?: string): string {
  const d = parseEventDate(value);
  if (!d) return value || '';
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

// Formats a start/end pair as a compact French range, e.g. "11 - 14 août 2026",
// "28 août - 2 septembre 2026", or "30 décembre 2026 - 2 janvier 2027".
// Falls back to a single-date format when there's no end date or it equals the start.
export function formatEventDateRange(start?: string, end?: string): string {
  const d1 = parseEventDate(start);
  if (!d1) return start || '';
  const d2 = parseEventDate(end);
  if (!d2 || d2.getTime() === d1.getTime()) return formatEventDate(start);

  const sameYear = d1.getFullYear() === d2.getFullYear();
  const sameMonth = sameYear && d1.getMonth() === d2.getMonth();

  if (sameMonth) {
    return `${d1.getDate()} - ${d2.getDate()} ${MONTHS_FR[d1.getMonth()]} ${d1.getFullYear()}`;
  }
  if (sameYear) {
    return `${d1.getDate()} ${MONTHS_FR[d1.getMonth()]} - ${d2.getDate()} ${MONTHS_FR[d2.getMonth()]} ${d1.getFullYear()}`;
  }
  return `${formatEventDate(start)} - ${formatEventDate(end)}`;
}

export function isPastDate(d: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(d);
  cmp.setHours(0, 0, 0, 0);
  return cmp.getTime() < today.getTime();
}

// The date that determines whether an event is over: its end date if set, else its start date.
export function getEventEndReference(item: { date?: string; endDate?: string }): Date | null {
  return parseEventDate(item.endDate) || parseEventDate(item.date);
}
