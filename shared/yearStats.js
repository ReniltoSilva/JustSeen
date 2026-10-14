import { genreName } from "./genres.js";

/* Everything Year in Film shows, worked out from one year of reviews.
Plain functions with no React in them, so they're easy to read and test */

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const fullMonthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const dayNumber = (day) => Math.round(new Date(`${day}T12:00:00`).getTime() / 86_400_000);

/* Most days in a row with at least one movie */
const longestStreak = (reviews) => {
  const days = [...new Set(reviews.map((review) => dayNumber(review.watched_on)))].sort((a, b) => a - b);
  let best = 0;
  let current = 0;
  days.forEach((day, index) => {
    current = index > 0 && day === days[index - 1] + 1 ? current + 1 : 1;
    best = Math.max(best, current);
  });
  return best;
};

export const yearStats = (reviews) => {
  const byDate = [...reviews].sort((a, b) => a.watched_on.localeCompare(b.watched_on));
  const rated = [...reviews].sort((a, b) => Number(b.rating) - Number(a.rating) || b.watched_on.localeCompare(a.watched_on));

  const minutes = reviews.reduce((sum, review) => sum + (review.runtime ?? 0), 0);
  const missingRuntime = reviews.filter((review) => !review.runtime).length;

  const perMonth = monthNames.map((label, month) => {
    const count = reviews.filter((review) => Number(review.watched_on.slice(5, 7)) === month + 1).length;
    return { label, value: count, tooltip: `${count} ${count === 1 ? "movie" : "movies"} in ${fullMonthNames[month]}` };
  });
  const busiest = perMonth.reduce((best, month, index) => (month.value > perMonth[best].value ? index : best), 0);

  const genreCounts = new Map();
  for (const review of reviews) {
    for (const id of review.genre_ids ?? []) {
      if (genreName(id)) genreCounts.set(id, (genreCounts.get(id) ?? 0) + 1);
    }
  }
  const topGenres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, count]) => ({ name: genreName(id), count }));

  /* Ratings from ½ to 5 stars, in half steps */
  const ratingSpread = Array.from({ length: 10 }, (_, index) => {
    const value = (index + 1) / 2;
    const count = reviews.filter((review) => Number(review.rating) === value).length;
    return {
      label: value % 1 ? `${Math.floor(value) || ""}½` : String(value), // ½, 1, 1½, 2 ...
      value: count,
      tooltip: `${count} ${count === 1 ? "movie" : "movies"} rated ${value} ★`,
    };
  });

  const withRelease = reviews.filter((review) => review.release_date);
  const oldest = withRelease.sort((a, b) => a.release_date.localeCompare(b.release_date))[0];

  const agreeCount = (review) => (review.reactions ?? []).filter((reaction) => reaction.kind === "agree").length;
  const mostAgreed = [...reviews].sort((a, b) => agreeCount(b) - agreeCount(a))[0];

  const average = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1)
    : null;

  return {
    count: reviews.length,
    hours: Math.round(minutes / 60),
    minutes,
    missingRuntime,
    average,
    perMonth,
    busiestMonth: perMonth[busiest].value > 0 ? fullMonthNames[busiest] : null,
    busiestCount: perMonth[busiest].value,
    topGenres,
    ratingSpread,
    favorite: rated[0],
    /* Only call something a letdown when there's enough to compare */
    letdown: reviews.length >= 3 && Number(rated.at(-1).rating) < Number(rated[0].rating) ? rated.at(-1) : null,
    streak: longestStreak(reviews),
    first: byDate[0],
    latest: byDate.at(-1),
    oldest,
    mostAgreed: mostAgreed && agreeCount(mostAgreed) > 0 ? { review: mostAgreed, agrees: agreeCount(mostAgreed) } : null,
  };
};
