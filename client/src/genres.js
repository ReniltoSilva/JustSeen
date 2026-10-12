/* TMDB's movie genres, by id */
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
};

export const genreName = (id) => genres[id];

/* Genre ids that appear in a list of movies, sorted by name */
export const genresIn = (movies) =>
  [...new Set(movies.flatMap((movie) => movie.genre_ids ?? []))]
    .filter((id) => genreName(id))
    .sort((a, b) => genreName(a).localeCompare(genreName(b)));

export const filterByGenre = (movies, genre) =>
  genre === "All" ? movies : movies.filter((movie) => (movie.genre_ids ?? []).includes(genre));
