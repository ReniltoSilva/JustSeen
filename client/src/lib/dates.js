/* Date helpers. Dates like "2026-10-10" are calendar days with no time; reading
them as midday local time keeps them on the right day in every timezone */

const asDay = (day) => new Date(`${day}T12:00:00`);

const pad = (n) => String(n).padStart(2, "0");

/* Today as "2026-10-10" in my own timezone (toISOString would use UTC) */
export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
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

/* "today", "yesterday", or "Oct 8" */
export const relativeDay = (day) => {
  if (!day) return "";
  const date = asDay(day).toDateString();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date === today.toDateString()) return "today";
  if (date === yesterday.toDateString()) return "yesterday";
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
