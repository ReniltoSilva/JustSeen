import { siteUrl } from "./site";
import { toTitle } from "../../../shared/titles";

/* Movie and TV show data from TMDB, through the website's /api/tmdb, which adds the
secret token (client/netlify/functions/tmdb.mjs). The token never ships inside the app */
const get = async (path, params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${siteUrl}/api/tmdb/${path}${query ? `?${query}` : ""}`);
  if (!response.ok) throw new Error(`TMDB request failed (${response.status})`);
  return response.json();
};

/* Movies and TV shows in one search (the same as the website; actors are left out) */
export const searchTitles = async (query) => {
  const data = await get("search/multi", { query, include_adult: false });
  return data.results.filter((item) => item.media_type === "movie" || item.media_type === "tv").map((item) => toTitle(item));
};

/* A movie's or show's details. Movies include the runtime, which Year in Film needs.
The title's page also asks for the cast and crew with { append_to_response: "credits" } */
export const getTitleDetails = (mediaType, id, params) => get(`${mediaType === "tv" ? "tv" : "movie"}/${id}`, params);

/* Posters come straight from TMDB's image servers */
export const posterUrl = (path, size = "w500") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);
