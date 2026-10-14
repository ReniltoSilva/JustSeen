import { siteUrl } from "./site";

/* Movie data from TMDB, through the website's /api/tmdb, which adds the secret
token (client/netlify/functions/tmdb.mjs). The token never ships inside the app */
const get = async (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${siteUrl}/api/tmdb/${path}${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
  return response.json();
};

/* The movie fields JustSeen stores with reviews (same as the website's toMovie) */
export const toMovie = (movie) => ({
  movie_id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path || null,
  overview: movie.overview || "",
  genre_ids: movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [],
  release_date: movie.release_date || null, // TMDB sends "" when unknown
});

export const searchMovies = async (query) => {
  const data = await get("search/movie", { query, include_adult: false });
  return data.results.map(toMovie);
};

/* Details include the runtime, which Year in Film needs */
export const getMovieDetails = (movieId) => get(`movie/${movieId}`);

/* Movie posters come straight from TMDB's image servers */
export const posterUrl = (path, size = "w500") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);
