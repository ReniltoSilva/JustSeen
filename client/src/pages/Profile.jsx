import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getProfileByUsername } from "../data/profiles";
import { getUserReviews } from "../data/reviews";
import { getWatchlist } from "../data/watchlist";
import { filterByGenre, genresIn } from "../genres";
import MovieCard from "../components/MovieCard";
import Masonry from "../components/Masonry";
import ProfileHeader from "../components/ProfileHeader";
import GenreChips from "../components/GenreChips";
import EmptyState from "../components/EmptyState";
import { MovieGridSkeleton, ProfileHeaderSkeleton } from "../components/Skeletons";

/* Someone's profile: their stats, what they watched and what they want to watch */
const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const { version, watchlist: myWatchlist } = useLibrary();

  const [person, setPerson] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [theirWatchlist, setTheirWatchlist] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "missing" | "error"
  const [tab, setTab] = useState("watched");
  const [selectedGenre, setSelectedGenre] = useState("All");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const found = await getProfileByUsername(username);
        if (cancelled) return;
        if (!found) return setStatus("missing");

        const [reviewList, list] = await Promise.all([getUserReviews(found.id), getWatchlist(found.id)]);
        if (cancelled) return;
        setPerson(found);
        setReviews(reviewList);
        setTheirWatchlist(list);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load profile:", error);
        if (!cancelled) setStatus("error");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [username, version]);

  if (status === "missing" || status === "error") {
    return (
      <EmptyState
        emoji={status === "missing" ? "🔍" : "⚠️"}
        title={status === "missing" ? `There's nobody called @${username}` : "Couldn't load this profile"}
        message={status === "missing" ? "Check the spelling, or search for them instead." : "Check your connection and try again."}
        actions={[{ to: "/people?tab=find", label: "Find people" }]}
      />
    );
  }

  const isMe = person?.id === user.id;
  /* My own watchlist comes from the shared library, so changes show instantly */
  const watchlist = isMe ? myWatchlist : (theirWatchlist ?? []);
  const tabs = [
    { key: "watched", label: "Watched", count: reviews?.length },
    { key: "watchlist", label: "Watchlist", count: watchlist.length },
  ];
  const movies = tab === "watched" ? (reviews ?? []) : watchlist;
  const shown = filterByGenre(movies, selectedGenre);
  const firstName = person?.name.split(" ")[0];

  const chooseTab = (key) => {
    setTab(key);
    setSelectedGenre("All");
  };

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      {status === "loading" ? <ProfileHeaderSkeleton /> : <ProfileHeader profile={person} reviews={reviews} />}

      <section className="max-w-7xl mx-auto flex flex-col gap-4 pt-8 pb-6">
        {/* Watched / Watchlist tabs */}
        <div className="flex gap-6 border-b border-line" role="tablist">
          {tabs.map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => chooseTab(key)}
              className={`relative pb-3 text-lg font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full ${
                tab === key ? "text-fg after:bg-brand" : "text-muted hover:text-fg after:bg-transparent"
              }`}
            >
              {label}
              {count !== undefined && <span className="ml-1.5 text-sm font-medium text-muted">{count}</span>}
            </button>
          ))}
        </div>

        {movies.length > 0 && (
          <GenreChips genres={genresIn(movies)} selected={selectedGenre} onSelect={setSelectedGenre} />
        )}
      </section>

      <main className="max-w-7xl mx-auto pb-16">
        {status === "loading" && <MovieGridSkeleton count={5} withHeader={tab === "watched"} />}

        {status === "ready" && movies.length === 0 && (
          <EmptyState
            emoji={tab === "watched" ? "🎬" : "🔖"}
            title={
              tab === "watched"
                ? `${isMe ? "You haven't" : `${firstName} hasn't`} reviewed anything yet`
                : `${isMe ? "Your" : `${firstName}'s`} watchlist is empty`
            }
            actions={isMe ? [{ to: "/search", label: "Find a movie" }] : []}
          />
        )}

        {movies.length > 0 && shown.length === 0 && (
          <p className="text-center text-muted py-16">No movies in this genre.</p>
        )}

        <Masonry
          items={shown}
          getKey={(movie) => `${tab}-${movie.id ?? movie.movie_id}`}
          renderItem={(movie) =>
            tab === "watched" ? (
              <MovieCard movie={movie} review={movie} variant="review" />
            ) : (
              <MovieCard movie={movie} variant={isMe ? "watchlist" : "movie"} />
            )
          }
        />

        {status === "ready" && !isMe && tab === "watched" && reviews.length > 0 && (
          <p className="mt-10 text-center text-sm text-muted">
            See {firstName}'s highlights in{" "}
            <Link to={`/u/${person.username}/year/${new Date().getFullYear()}`} className="font-semibold text-brand-soft hover:underline">
              {new Date().getFullYear()} in film
            </Link>
          </p>
        )}
      </main>
    </div>
  );
};

/* A new key per username makes React start a fresh Profile (empty state, "loading")
when you go from one profile to another, instead of briefly showing the old one */
const ProfileRoute = () => {
  const { username } = useParams();
  return <Profile key={username} />;
};

export default ProfileRoute;
