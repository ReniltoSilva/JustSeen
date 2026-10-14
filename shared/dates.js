/* Date helpers. Dates like "2026-10-10" are calendar days with no time; reading
them as midday local time keeps them on the right day in every timezone */

const asDay = (day) => new Date(`${day}T12:00:00`);

const pad = (n) => String(n).padStart(2, "0");

/* A Date as "2026-10-10" in my own timezone (toISOString would use UTC) */
export const toDay = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/* Today as "2026-10-10" in my own timezone */
export const localToday = () => toDay(new Date());

/* "2026-10-10" moved by a number of days: addDays("2026-10-10", -1) is "2026-10-09" */
export const addDays = (day, days) => {
  const date = asDay(day);
  date.setDate(date.getDate() + days);
  return toDay(date);
};

/* Milliseconds until midnight, when "today" becomes "yesterday" */
export const msUntilTomorrow = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
};

/* "Oct 10", year added when it isn't this year (or always, with full) */
export const formatDay = (day, { full = false } = {}) => {
  if (!day) return "";
  const date = asDay(day);
  const showYear = full || date.getFullYear() !== new Date().getFullYear();
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(showYear && { year: "numeric" }),
  });
};

/* "today", "yesterday", or "Oct 8". Screens pass `today` from their useToday hook,
so the words change at midnight instead of staying as they were first drawn */
export const relativeDay = (day, today = localToday()) => {
  if (!day) return "";
  if (day === today) return "today";
  if (day === addDays(today, -1)) return "yesterday";
  return formatDay(day);
};

/* "just now", "5m", "3h", "2d", then a date */
export const timeAgo = (timestamp) => {
  const seconds = Math.round((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const releaseYear = (releaseDate) => releaseDate?.slice(0, 4) ?? "";
