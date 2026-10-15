/* TMDB's genres, by id: the movie ones, then the ones only TV shows use (shows share
Animation, Comedy, Crime, Documentary, Drama, Family, Mystery and Western with movies) */
const genres = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

export const genreName = (id) => genres[id];

/* Genre ids that appear in a list of movies and shows, sorted by name */
export const genresIn = (movies) =>
  [...new Set(movies.flatMap((movie) => movie.genre_ids ?? []))]
    .filter((id) => genreName(id))
    .sort((a, b) => genreName(a).localeCompare(genreName(b)));

export const filterByGenre = (movies, genre) =>
  genre === "All" ? movies : movies.filter((movie) => (movie.genre_ids ?? []).includes(genre));
