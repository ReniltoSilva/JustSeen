/* Movie data from TMDB. Requests go to /api/tmdb, which adds the secret token:
Vite's dev proxy locally, a Netlify Function in production */

const get = async (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/tmdb/${path}${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
  return response.json();
};

/* The movie fields JustSeen stores with reviews and watchlist entries */
export const toMovie = (movie) => ({
  movie_id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path || null,
  overview: movie.overview || "",
  genre_ids: movie.genre_ids ?? movie.genres?.map((genre) => genre.id) ?? [],
  release_date: movie.release_date || null, // TMDB sends "" when unknown
});

export const searchMovies = async (query, page = 1) => {
  const data = await get("search/movie", { query, page, include_adult: false });
  return {
    movies: data.results.map(toMovie),
    totalResults: data.total_results,
    totalPages: data.total_pages,
  };
};

/* Everything the movie page shows: details, runtime, cast and crew */
export const getMovieDetails = (movieId) =>
  get(`movie/${movieId}`, { append_to_response: "credits" });

export const posterUrl = (posterPath, size = "w500") =>
  posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : null;
