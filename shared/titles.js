/* Movies and TV shows. JustSeen keeps both, told apart by media_type: "movie" or "tv".
movie_id is the TMDB id, and TMDB numbers movies and shows separately, so a title is
only identified by its type and id together (see 0007_tv_shows.sql) */

export const isShow = (item) => item?.media_type === "tv";

/* "movie:438631" / "tv:1399": one key per title, for Maps and list keys */
export const titleKey = (item) => `${item.media_type ?? "movie"}:${item.movie_id}`;

export const sameTitle = (a, b) => titleKey(a) === titleKey(b);

/* The title's own page: /movie/438631 or /tv/1399 (the same on the website and in the app) */
export const titlePath = (item) => `/${isShow(item) ? "tv" : "movie"}/${item.movie_id}`;

/* "Movie" / "TV show" */
export const kindLabel = (item) => (isShow(item) ? "TV show" : "Movie");

/* "1 movie", "12 movies", "1 TV show", "3 TV shows" */
export const countLabel = (count, mediaType = "movie") =>
  `${count.toLocaleString()} ${mediaType === "tv" ? (count === 1 ? "TV show" : "TV shows") : count === 1 ? "movie" : "movies"}`;

/* "12 movies · 3 TV shows", leaving out a kind there's none of ("12 movies").
Nothing at all reads "0 movies" */
export const mixLabel = (items) => {
  const shows = items.filter(isShow).length;
  const movies = items.length - shows;
  const parts = [movies && countLabel(movies), shows && countLabel(shows, "tv")].filter(Boolean);
  return parts.length ? parts.join(" · ") : countLabel(0);
};

/* A TMDB search result or details (movie or show) -> the fields JustSeen stores with
reviews and watchlist entries. Shows call their title "name" and their release
"first_air_date"; TMDB sends "" when a date is unknown */
export const toTitle = (item, mediaType = item.media_type ?? "movie") => ({
  media_type: mediaType,
  movie_id: item.id,
  title: item.title ?? item.name ?? "",
  poster_path: item.poster_path || null,
  overview: item.overview || "",
  genre_ids: item.genre_ids ?? item.genres?.map((genre) => genre.id) ?? [],
  release_date: (mediaType === "tv" ? item.first_air_date : item.release_date) || null,
});

/* What JustSeen stores about a title, taken from a review or a watchlist entry */
export const titleOf = ({ media_type, movie_id, title, poster_path, overview, genre_ids, release_date, runtime }) => ({
  media_type: media_type ?? "movie",
  movie_id,
  title,
  poster_path,
  overview,
  genre_ids,
  release_date,
  runtime,
});
