import { toTitle } from "./titles";

/* Movie and TV show data from TMDB. Requests go to /api/tmdb, which adds the secret
token: Vite's dev proxy locally, a Netlify Function in production */

const get = async (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/tmdb/${path}${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
  return response.json();
};

/* Movies and TV shows in one search (TMDB's "multi" search also finds actors, which
are left out) */
export const searchTitles = async (query, page = 1) => {
  const data = await get("search/multi", { query, page, include_adult: false });
  return {
    titles: data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv").map((item) => toTitle(item)),
    totalPages: data.total_pages,
  };
};

/* Everything a movie's or show's page shows: details, runtime or seasons, cast and crew */
export const getTitleDetails = (mediaType, id) =>
  get(`${mediaType === "tv" ? "tv" : "movie"}/${id}`, { append_to_response: "credits" });

export const posterUrl = (posterPath, size = "w500") =>
  posterPath ? `https://image.tmdb.org/t/p/${size}${posterPath}` : null;
