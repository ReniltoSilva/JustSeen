import { router } from "expo-router";

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
