import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { genreName } from "../genres";
import { posterUrl } from "../lib/tmdb";
import { formatDay, relativeDay, releaseYear } from "../lib/dates";
import ReviewModal from "./ReviewModal";
import ReactionBar from "./ReactionBar";
import UserAvatar from "./UserAvatar";
import {
  BookmarkIcon,
  CheckIcon,
  CloseIcon,
  EyeIcon,
  PencilIcon,
  StarIcon,
  StarPlusIcon,
} from "./icons";

/* Search results show up to this many characters of the overview */
const overviewPreviewLength = 200;

/* Cut at the last whole word before the limit */
const shorten = (text, limit) => {
  if (text.length <= limit) return text;
  const cut = text.slice(0, limit);
  return `${cut.slice(0, cut.lastIndexOf(" ") > 0 ? cut.lastIndexOf(" ") : limit).trimEnd()}…`;
};

/* Round icon button on the poster, styled like frosted glass */
const PosterButton = ({ title, onClick, pressed, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    aria-pressed={pressed}
    onClick={onClick}
    className="grid place-items-center w-8 h-8 rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-brand"
  >
    {children}
  </button>
);

/*
  One movie as a card. Three kinds:
  - variant "review":    someone's review (`review` has the author, rating, text and reactions)
  - variant "watchlist": a movie on MY watchlist, with remove and "watched it?" buttons
  - variant "movie":     just a movie (search results, someone else's watchlist)
*/
const MovieCard = ({ movie, review, variant = "movie", showOverviewText = false }) => {
  const { user } = useAuth();
  const { myReviewFor, isSaved, toggleWatchlist } = useLibrary();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [busy, setBusy] = useState(false);

  const isReview = variant === "review" && review;
  const isMine = isReview && review.user_id === user?.id;
  const myReview = myReviewFor(movie.movie_id);
  const saved = isSaved(movie.movie_id);

  /* Saving for later only makes sense before I've watched it (or to un-save it) */
  const canSave = Boolean(user) && (!myReview || saved);
  const genres = (movie.genre_ids ?? []).filter((id) => genreName(id)).slice(0, 3);
  const year = releaseYear(movie.release_date);
  const poster = posterUrl(movie.poster_path);
  const hasOverlay = Boolean(movie.overview) && !showOverviewText;

  const toggleSave = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await toggleWatchlist(movie);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setBusy(false);
    }
  };

  /* Buttons on the poster shouldn't also open the overview */
  const posterAction = (action) => (e) => {
    e.stopPropagation();
    action();
  };

  return (
    <article className="group flex flex-col bg-panel border border-line rounded-2xl overflow-hidden transition duration-300 hover:border-line-strong hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)]">
      {/* Who watched it and when */}
      {isReview && review.author && (
        <div className="px-3 py-2.5 flex items-center gap-2.5 border-b border-fg/[0.05]">
          <Link
            to={`/u/${review.author.username}`}
            className="shrink-0 rounded-full ring-2 ring-fg/10 hover:ring-brand/60 transition"
          >
            <UserAvatar user={review.author} className="w-9" />
          </Link>
          <div className="flex flex-col min-w-0 leading-tight gap-0.5">
            <span className="flex items-center gap-1.5 min-w-0">
              <Link
                to={`/u/${review.author.username}`}
                className="text-sm font-semibold text-fg truncate hover:text-brand-soft transition-colors"
              >
                {review.author.name}
              </Link>
              {isMine && (
                <span className="shrink-0 rounded-full bg-brand/20 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-soft">
                  You
                </span>
              )}
            </span>
            <span
              className="flex items-center gap-1 text-xs text-muted truncate"
              title={formatDay(review.watched_on, { full: true })}
            >
              <EyeIcon />
              Watched {relativeDay(review.watched_on)}
            </span>
          </div>
        </div>
      )}

      {/* Poster: hover (or tap on phones) shows what the movie is about */}
      <div
        className={`relative aspect-[2/3] w-full overflow-hidden bg-panel-2 ${hasOverlay ? "cursor-pointer" : ""}`}
        onClick={hasOverlay ? () => setShowOverview(!showOverview) : undefined}
        onKeyDown={
          hasOverlay
            ? (e) => (e.key === "Enter" || e.key === " ") && setShowOverview(!showOverview)
            : undefined
        }
        role={hasOverlay ? "button" : undefined}
        tabIndex={hasOverlay ? 0 : undefined}
        aria-expanded={hasOverlay ? showOverview : undefined}
        aria-label={hasOverlay ? `What is ${movie.title} about?` : undefined}
      >
        {poster ? (
          <img
            src={poster}
            alt={movie.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center p-4 text-center font-display text-lg text-muted">
            {movie.title}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-panel to-transparent pointer-events-none" />

        {hasOverlay && (
          <div
            className={`absolute inset-0 flex flex-col bg-black/85 backdrop-blur-[2px] px-4 pt-12 pb-6 transition-opacity duration-300 ${
              showOverview ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#b4a3ff]">
              Overview
            </p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-white/90 overflow-y-auto">
              {movie.overview}
            </p>
          </div>
        )}

        {/* I've seen this one too */}
        {myReview && !isMine && (
          <div
            className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur px-2 py-0.5 text-[11px] font-semibold text-white shadow"
            title={`You watched this on ${formatDay(myReview.watched_on, { full: true })}`}
          >
            <CheckIcon />
            You watched
          </div>
        )}

        {/* Quick actions, grouped in one frosted pill */}
        {user && (
          <div className="absolute top-2 right-2 flex flex-col rounded-full bg-black/45 backdrop-blur-md ring-1 ring-white/15 p-0.5 shadow-lg">
            {variant !== "watchlist" && (
              <PosterButton
                title={myReview ? "Edit your review" : "Write a review"}
                onClick={posterAction(() => setShowReviewModal(true))}
                pressed={Boolean(myReview)}
              >
                {/* A pencil means "edit what I wrote", a star-plus means "rate it" */}
                {myReview ? (
                  <span className="text-amber-400">
                    <PencilIcon />
                  </span>
                ) : (
                  <StarPlusIcon />
                )}
              </PosterButton>
            )}
            {variant === "watchlist" ? (
              <PosterButton title="Remove from watchlist" onClick={posterAction(toggleSave)}>
                <CloseIcon />
              </PosterButton>
            ) : (
              canSave && (
                <PosterButton
                  title={saved ? "Remove from watchlist" : "Add to watchlist"}
                  onClick={posterAction(toggleSave)}
                  pressed={saved}
                >
                  <span className={saved ? "text-[#b4a3ff]" : "text-white"}>
                    <BookmarkIcon filled={saved} />
                  </span>
                </PosterButton>
              )
            )}
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-1 px-3.5 pb-3.5 pt-2.5">
        {/* Title, their rating and the year share one line */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-fg text-[15px] leading-snug line-clamp-2" title={movie.title}>
            <Link to={`/movie/${movie.movie_id}`} className="hover:text-brand-soft transition-colors">
              {movie.title}
            </Link>
          </h3>
          <span className="flex items-center gap-2 shrink-0 pt-0.5 text-xs tabular-nums">
            {isReview && (
              <span
                className="flex items-center gap-0.5 font-semibold text-amber-500"
                title={`Rated ${Number(review.rating)} out of 5`}
              >
                <StarIcon className="w-3 h-3" />
                {Number(review.rating)}
              </span>
            )}
            {year && <span className="text-muted">{year}</span>}
          </span>
        </div>

        {/* Genres as small outlined chips */}
        {genres.length > 0 && (
          <ul className="flex flex-wrap gap-1 mt-2">
            {genres.map((genre) => (
              <li
                key={genre}
                className="rounded-full ring-1 ring-inset ring-fg/10 px-2 py-0.5 text-[11px] font-medium text-soft"
              >
                {genreName(genre)}
              </li>
            ))}
          </ul>
        )}

        {/* The whole review, reviews are at most 250 characters */}
        {isReview && review.review && (
          <p className="text-[13px] text-soft mt-2.5 leading-relaxed break-words">{review.review}</p>
        )}

        {showOverviewText && movie.overview && (
          <p className="text-[13px] text-soft mt-2.5 leading-relaxed">
            {shorten(movie.overview, overviewPreviewLength)}
          </p>
        )}

        {isReview && (
          <div className="pt-3 mt-auto">
            <ReactionBar review={review} />
          </div>
        )}

        {variant === "watchlist" && (
          <div className="pt-3 mt-auto">
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full bg-brand hover:bg-brand-hover px-3 py-2 text-xs font-semibold text-white transition-colors"
            >
              <StarIcon className="w-3.5 h-3.5" /> Watched it? Review
            </button>
          </div>
        )}
      </div>

      {showReviewModal && <ReviewModal movie={movie} onClose={() => setShowReviewModal(false)} />}
    </article>
  );
};

export default MovieCard;
