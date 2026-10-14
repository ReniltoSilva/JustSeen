import { router } from "expo-router";

/* Opening the app's screens from anywhere: a movie, a person, the review form */

export const openMovie = (movieId) => router.push(`/movie/${movieId}`);

export const openProfile = (username) => router.push(`/u/${username}`);

/* Movies handed to the review screen. Only the id travels in the screen's address
(/review/438631); the movie itself waits here, so the screen opens instantly. If it's
missing (the app reloaded on that screen), the screen loads the movie from TMDB */
const movies = new Map();
let lastOpened = null;

/* The movie for this id, or the one just opened if the id didn't come through */
export const pendingMovie = (movieId) => movies.get(Number(movieId)) ?? (movieId ? undefined : lastOpened);

/* Opens the review screen for a movie ({ movie_id, title, poster_path, ... }) */
export const openReview = (movie) => {
  movies.set(movie.movie_id, movie);
  lastOpened = movie;
  router.push(`/review/${movie.movie_id}`);
};

/* The movie fields of a review, for editing it */
export const movieOf = ({ movie_id, title, poster_path, overview, genre_ids, release_date, runtime }) => ({
  movie_id,
  title,
  poster_path,
  overview,
  genre_ids,
  release_date,
  runtime,
});

/* Leaves a screen that slid up (the review form, edit profile): back to where it was
opened from, or to the feed when there's nothing behind it */
export const closeSheet = () => {
  if (router.canGoBack()) router.back();
  else router.replace("/");
};

/* Someone's followers or the people they follow; `list` is "followers" or "following" */
export const openFollows = (username, list) => router.push(`/follows/${username}?list=${list}`);
