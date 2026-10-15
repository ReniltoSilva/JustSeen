import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getFeed } from "../data/reviews";
import { filterByGenre, genreName, genresIn } from "../genres";
import MovieCard from "../components/MovieCard";
import ProfileHeader from "../components/ProfileHeader";
import GenreChips from "../components/GenreChips";
import PageHeading from "../components/PageHeading";
import Masonry from "../components/Masonry";
import EmptyState from "../components/EmptyState";
import { MovieGridSkeleton } from "../components/Skeletons";
import { usePageMeta } from "../lib/usePageMeta";

/* Reviews by me and the people I follow, newest first */
const Feed = () => {
  usePageMeta({ title: "Feed" });
  const { user } = useAuth();
  const { ready, followingIds, version } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");

  /* A key that changes when the list of people changes, to reload the feed */
  const peopleKey = [...followingIds].sort().join(",");

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    const ids = [user.id, ...peopleKey.split(",").filter(Boolean)];
    getFeed(ids)
      .then((data) => {
        if (cancelled) return;
        setReviews(data);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load feed:", err);
        if (!cancelled) setError("Couldn't load your feed. Check your connection and try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [ready, user.id, peopleKey, version]);

  /* The movie or show fields live on the review row itself */
  const shown = filterByGenre(reviews ?? [], selectedGenre);
  const followsNobody = followingIds.size === 0;

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      <ProfileHeader />

      <section className="max-w-7xl mx-auto flex flex-col gap-4 pt-8 pb-6">
        <PageHeading
          title="Latest activity"
          subtitle="What you and the people you follow watched lately, newest first."
        />
        {reviews?.length > 0 && (
          <GenreChips genres={genresIn(reviews)} selected={selectedGenre} onSelect={setSelectedGenre} />
        )}
      </section>

      <main className="max-w-7xl mx-auto pb-16">
        {error && <p className="text-sm text-disagree">{error}</p>}

        {reviews === null && !error && <MovieGridSkeleton />}

        {reviews?.length === 0 && (
          <EmptyState
            emoji={followsNobody ? "👋" : "🍿"}
            title={followsNobody ? "Welcome to JustSeen!" : "Nothing here yet"}
            message={
              followsNobody
                ? "Start by logging a movie or show you've seen, and follow a few people to fill your feed with their reviews."
                : "When you or the people you follow review a movie or show, it'll show up here."
            }
            actions={[
              { to: "/search", label: "Find something to review" },
              { to: "/people", label: "Find people to follow" },
            ]}
          />
        )}

        {reviews?.length > 0 && shown.length === 0 && (
          <p className="text-center text-muted py-16">Nothing in {genreName(selectedGenre)} in your feed yet.</p>
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

export default Feed;
