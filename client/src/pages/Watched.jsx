import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getUserReviews } from "../data/reviews";
import { filterByGenre, genresIn } from "../genres";
import MovieCard from "../components/MovieCard";
import ProfileHeader from "../components/ProfileHeader";
import GenreChips from "../components/GenreChips";
import PageHeading from "../components/PageHeading";
import Masonry from "../components/Masonry";
import EmptyState from "../components/EmptyState";
import { MovieGridSkeleton } from "../components/Skeletons";
import { usePageMeta } from "../lib/usePageMeta";
import { mixLabel } from "../lib/titles";

/* Every movie and show I've reviewed, newest first */
const Watched = () => {
  usePageMeta({ title: "Watched" });
  const { user } = useAuth();
  const { version } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    let cancelled = false;
    getUserReviews(user.id)
      .then((data) => !cancelled && setReviews(data))
      .catch((err) => {
        console.error("Failed to load what I watched:", err);
        if (!cancelled) setError("Couldn't load what you watched. Check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [user.id, version]);

  const shown = filterByGenre(reviews ?? [], selectedGenre);
  const count = reviews?.length ?? 0;

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      <ProfileHeader />

      <section className="max-w-7xl mx-auto flex flex-col gap-4 pt-8 pb-6">
        <PageHeading
          title="Watched"
          subtitle={reviews ? `${mixLabel(reviews)} you've watched and reviewed.` : " "}
        />
        {count > 0 && (
          <GenreChips genres={genresIn(reviews)} selected={selectedGenre} onSelect={setSelectedGenre} />
        )}
      </section>

      <main className="max-w-7xl mx-auto pb-16">
        {error && <p className="text-sm text-disagree">{error}</p>}
        {reviews === null && !error && <MovieGridSkeleton />}

        {reviews?.length === 0 && (
          <EmptyState
            emoji="🎬"
            title="Your film diary starts here"
            message="Search for a movie or show you've seen, give it a rating and a few words, and it'll show up here."
            actions={[{ to: "/search", label: "Find a movie or show" }]}
          />
        )}

        {count > 0 && shown.length === 0 && (
          <p className="text-center text-muted py-16">Nothing in this genre yet.</p>
        )}

        <Masonry
          items={shown}
          getKey={(review) => review.id}
          renderItem={(review) => <MovieCard movie={review} review={review} variant="review" />}
        />
      </main>
    </div>
  );
};

export default Watched;
