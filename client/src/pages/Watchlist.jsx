import { useState } from "react";
import { useLibrary } from "../library/LibraryContext";
import { filterByGenre, genresIn } from "../genres";
import MovieCard from "../components/MovieCard";
import ProfileHeader from "../components/ProfileHeader";
import GenreChips from "../components/GenreChips";
import PageHeading from "../components/PageHeading";
import Masonry from "../components/Masonry";
import EmptyState from "../components/EmptyState";
import { MovieGridSkeleton } from "../components/Skeletons";

/* Movies I want to watch. The list lives in the shared library, so saving a
movie anywhere in the app shows up here straight away */
const Watchlist = () => {
  const { ready, watchlist } = useLibrary();
  const [selectedGenre, setSelectedGenre] = useState("All");

  const shown = filterByGenre(watchlist, selectedGenre);
  const count = watchlist.length;

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      <ProfileHeader />

      <section className="max-w-7xl mx-auto flex flex-col gap-4 pt-8 pb-6">
        <PageHeading
          title="Watchlist"
          subtitle={`${count} ${count === 1 ? "movie" : "movies"} you want to watch.`}
        />
        {count > 0 && (
          <GenreChips genres={genresIn(watchlist)} selected={selectedGenre} onSelect={setSelectedGenre} />
        )}
      </section>

      <main className="max-w-7xl mx-auto pb-16">
        {!ready && <MovieGridSkeleton withHeader={false} />}

        {ready && count === 0 && (
          <EmptyState
            emoji="🔖"
            title="Nothing saved yet"
            message="Tap the bookmark on any movie to save it for later. Reviewing it takes it off this list."
            actions={[
              { to: "/search", label: "Search movies" },
              { to: "/", label: "Browse your feed" },
            ]}
          />
        )}

        {count > 0 && shown.length === 0 && (
          <p className="text-center text-muted py-16">No movies in this genre.</p>
        )}

        <Masonry
          items={shown}
          getKey={(movie) => movie.movie_id}
          renderItem={(movie) => <MovieCard movie={movie} variant="watchlist" />}
        />
      </main>
    </div>
  );
};

export default Watchlist;
