/* Movie posters come straight from TMDB's image servers */
export const posterUrl = (path, size = "w500") => (path ? `https://image.tmdb.org/t/p/${size}${path}` : null);
