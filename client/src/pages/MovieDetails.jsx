import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getMovieDetails, posterUrl, toMovie } from "../lib/tmdb";
import { getMovieReviews } from "../data/reviews";
import { releaseYear } from "../lib/dates";
import ReviewNote from "../components/ReviewNote";
import Masonry from "../components/Masonry";
import ReviewModal from "../components/ReviewModal";
import EmptyState from "../components/EmptyState";
import { BookmarkIcon, PencilIcon, StarIcon, StarPlusIcon } from "../components/icons";
import { usePageMeta } from "../lib/usePageMeta";

const formatRuntime = (minutes) =>
  minutes ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : null;

const average = (reviews) =>
  reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : null;

/* One movie: details from TMDB, plus everything JustSeen people said about it */
const MovieDetails = () => {
  const { movieId } = useParams();
  const id = Number(movieId);
  const { user } = useAuth();
  const { myReviewFor, isSaved, toggleWatchlist, followingIds, version } = useLibrary();

  const [details, setDetails] = useState(null);
  usePageMeta({ title: details?.title });
  const [reviews, setReviews] = useState(null);
  const [status, setStatus] = useState("loading");
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMovieDetails(id)
      .then((data) => {
        if (cancelled) return;
        setDetails(data);
        setStatus("ready");
      })
      .catch((error) => {
        console.error("Failed to load movie:", error);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    getMovieReviews(id)
      .then((data) => !cancelled && setReviews(data))
      .catch((error) => console.error("Failed to load reviews:", error));
    return () => {
      cancelled = true;
    };
  }, [id, version]);

  if (status === "error" || Number.isNaN(id)) {
    return <EmptyState emoji="🎞️" title="We couldn't find that movie" actions={[{ to: "/search", label: "Search movies" }]} />;
  }

  if (!details) {
    return (
      <div className="animate-pulse" aria-hidden="true">
        <div className="h-64 md:h-96 bg-fg/[0.05]" />
      </div>
    );
  }

  const movie = toMovie(details);
  const myReview = myReviewFor(id);
  const saved = isSaved(id);
  const director = details.credits?.crew?.find((person) => person.job === "Director");
  const cast = details.credits?.cast?.slice(0, 8) ?? [];
  const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w1280${details.backdrop_path}` : null;

  /* People I follow first, then everyone else */
  const allReviews = reviews ?? [];
  const fromFollowing = allReviews.filter((review) => followingIds.has(review.user_id) || review.user_id === user.id);
  const fromOthers = allReviews.filter((review) => !fromFollowing.includes(review));
  const followingAverage = average(fromFollowing);
  const everyoneAverage = average(allReviews);

  const toggleSave = async () => {
    setSaving(true);
    try {
      await toggleWatchlist(movie);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Backdrop fading into the page */}
      <div className="relative h-56 sm:h-72 md:h-96 overflow-hidden">
        {backdrop && <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 -mt-32 sm:-mt-40 md:-mt-48">
        <div className="flex flex-col sm:flex-row gap-6 md:gap-10">
          <img
            src={posterUrl(details.poster_path, "w500") ?? undefined}
            alt={details.title}
            className="w-36 sm:w-48 md:w-64 aspect-[2/3] rounded-2xl object-cover shadow-2xl ring-1 ring-white/10 bg-panel-2 shrink-0"
          />

          <div className="flex-1 min-w-0 sm:pt-16 md:pt-24">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-fg">
              {details.title}{" "}
              <span className="text-xl md:text-3xl font-medium text-muted">{releaseYear(details.release_date)}</span>
            </h1>

            <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-soft">
              {formatRuntime(details.runtime) && <span>{formatRuntime(details.runtime)}</span>}
              {director && <span>Directed by <span className="font-medium text-fg">{director.name}</span></span>}
            </p>

            {details.genres?.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {details.genres.map((genre) => (
                  <li key={genre.id} className="rounded-full ring-1 ring-inset ring-fg/15 px-2.5 py-0.5 text-xs font-medium text-soft">
                    {genre.name}
                  </li>
                ))}
              </ul>
            )}

            {details.tagline && <p className="mt-5 font-display text-lg italic text-soft">“{details.tagline}”</p>}
            {details.overview && <p className="mt-3 max-w-2xl leading-relaxed text-soft">{details.overview}</p>}

            {/* My actions */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setReviewing(true)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                  myReview ? "bg-amber-400/15 text-amber-600 ring-1 ring-amber-400/40 hover:bg-amber-400/25 dark:text-amber-300" : "bg-brand text-white hover:bg-brand-hover"
                }`}
              >
                {myReview ? <PencilIcon /> : <StarPlusIcon />}
                {myReview ? `Your rating: ★ ${Number(myReview.rating)} · Edit` : "Rate & review"}
              </button>
              {(!myReview || saved) && (
                <button
                  type="button"
                  onClick={toggleSave}
                  disabled={saving}
                  aria-pressed={saved}
                  className="flex items-center gap-2 rounded-full bg-fg/[0.06] px-5 py-2.5 text-sm font-semibold text-fg ring-1 ring-inset ring-line-strong transition-colors hover:bg-fg/10 disabled:opacity-60"
                >
                  <BookmarkIcon filled={saved} />
                  {saved ? "On your watchlist" : "Add to watchlist"}
                </button>
              )}
            </div>

            {/* Only ratings from people on JustSeen: friends first, no critic scores */}
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { label: "People you follow", value: followingAverage, count: fromFollowing.length },
                { label: "Everyone on JustSeen", value: everyoneAverage, count: allReviews.length },
              ].map((rating) => (
                <div key={rating.label} className="rounded-2xl border border-line bg-panel px-4 py-3">
                  <p className="text-[11px] uppercase tracking-wider text-muted">{rating.label}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xl font-bold text-fg">
                    {rating.value ? (
                      <>
                        <StarIcon className="w-4 h-4 text-amber-500" />
                        {rating.value}
                      </>
                    ) : (
                      "—"
                    )}
                    <span className="ml-1 text-xs font-normal text-muted">
                      {rating.count ? `${rating.count.toLocaleString()} ${rating.count === 1 ? "rating" : "ratings"}` : "no ratings"}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top cast */}
        {cast.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold">Top cast</h2>
            <ul className="mt-4 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none]">
              {cast.map((person) => (
                <li key={person.credit_id} className="w-24 shrink-0 text-center">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-panel-2 ring-1 ring-line">
                    {person.profile_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-fg leading-tight">{person.name}</p>
                  <p className="text-xs text-muted leading-tight">{person.character}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* What people said */}
        <section className="mt-12">
          <h2 className="text-xl font-bold">Reviews on JustSeen</h2>
          {reviews && allReviews.length === 0 && (
            <p className="mt-3 text-soft">Nobody has reviewed this yet. Be the first!</p>
          )}

          {fromFollowing.length > 0 && (
            <>
              <p className="mt-4 mb-4 text-sm font-semibold text-muted">From you and people you follow</p>
              <Masonry
                items={fromFollowing}
                getKey={(review) => review.id}
                renderItem={(review) => <ReviewNote review={review} movie={movie} />}
              />
            </>
          )}

          {fromOthers.length > 0 && (
            <>
              <p className="mt-8 mb-4 text-sm font-semibold text-muted">From everyone else</p>
              <Masonry
                items={fromOthers}
                getKey={(review) => review.id}
                renderItem={(review) => <ReviewNote review={review} movie={movie} />}
              />
            </>
          )}
        </section>

        <p className="mt-16 text-center text-xs text-muted">
          Movie data and images from{" "}
          <a href={`https://www.themoviedb.org/movie/${id}`} target="_blank" rel="noreferrer" className="underline">
            TMDB
          </a>
          .
        </p>
      </div>

      {reviewing && <ReviewModal movie={movie} onClose={() => setReviewing(false)} />}
    </div>
  );
};

/* Start fresh (no old movie shown) when going from one movie page to another */
const MovieDetailsRoute = () => {
  const { movieId } = useParams();
  return <MovieDetails key={movieId} />;
};

export default MovieDetailsRoute;
