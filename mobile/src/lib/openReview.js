import { router } from "expo-router";

/* Movies handed to the review screen. Only the id travels in the screen's address;
the movie itself waits here, so the screen opens instantly. If it's missing (the app
reloaded on that screen), the screen loads the movie from TMDB instead */
const movies = new Map();

export const pendingMovie = (movieId) => movies.get(Number(movieId));

/* Opens the review screen for a movie ({ movie_id, title, poster_path, ... }) */
export const openReview = (movie) => {
  movies.set(movie.movie_id, movie);
  router.push({ pathname: "/review/[movieId]", params: { movieId: movie.movie_id } });
};
