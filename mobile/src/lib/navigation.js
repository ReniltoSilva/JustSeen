import { router } from "expo-router";
import { titleKey, titlePath } from "../../../shared/titles";

/* Opening the app's screens from anywhere: a movie or show, a person, the review form */

/* A movie's or show's page ({ media_type, movie_id }): /movie/438631 or /tv/1399 */
export const openTitle = (item) => router.push(titlePath(item));

export const openProfile = (username) => router.push(`/u/${username}`);

/* Titles handed to the review screen. Only the type and id travel in the screen's
address (/review/movie-438631, /review/tv-1399); the title itself waits here, so the
screen opens instantly. If it's missing (the app reloaded on that screen), the screen
loads it from TMDB */
const titles = new Map();
let lastOpened = null;

/* "tv-1399" -> { media_type: "tv", movie_id: 1399 }. Plain "438631" is a movie
(the old addresses) */
export const parseTitleParam = (param = "") => {
  const match = /^(?:(movie|tv)-)?(\d+)$/.exec(param);
  return match ? { media_type: match[1] ?? "movie", movie_id: Number(match[2]) } : null;
};

/* The title for this address, or the one just opened if the address didn't come through */
export const pendingTitle = (param) => {
  const parsed = parseTitleParam(param);
  return parsed ? titles.get(titleKey(parsed)) : param ? undefined : lastOpened;
};

/* Opens the review screen for a movie or show ({ media_type, movie_id, title, ... }) */
export const openReview = (item) => {
  titles.set(titleKey(item), item);
  lastOpened = item;
  router.push(`/review/${item.media_type ?? "movie"}-${item.movie_id}`);
};

/* Leaves a screen that slid up (the review form, edit profile): back to where it was
opened from, or to the feed when there's nothing behind it */
export const closeSheet = () => {
  if (router.canGoBack()) router.back();
  else router.replace("/");
};

/* Someone's followers or the people they follow; `list` is "followers" or "following" */
export const openFollows = (username, list) => router.push(`/follows/${username}?list=${list}`);

/* Reviews handed to the share screen, by review id (like the titles above) */
const shares = new Map();

export const pendingShare = (reviewId) => shares.get(reviewId);

/* Opens the share screen for one of my reviews: { reviewId, movie, rating, review,
author, justSaved }. `replace` swaps it in for the screen that's open (the review form) */
export const openShare = ({ reviewId, ...share }, { replace = false } = {}) => {
  shares.set(reviewId, share);
  if (replace) router.replace(`/share/${reviewId}`);
  else router.push(`/share/${reviewId}`);
};

/* Someone's year in film (this year unless another one is given) */
export const openYear = (username, year = new Date().getFullYear()) => router.push(`/year/${username}?year=${year}`);
