import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useShare } from "../share/ShareContext";
import { formatDay, relativeDay } from "../lib/dates";
import { useToday } from "../lib/useToday";
import ReviewModal from "./ReviewModal";
import ReactionBar from "./ReactionBar";
import UserAvatar from "./UserAvatar";
import { TicketIcon, PencilIcon, ShareIcon, StarIcon } from "./icons";

/* Five stars with halves: a half star is a full one cut down the middle */
const Stars = ({ rating }) => (
  <span className="flex items-center gap-0.5" aria-label={`Rated ${rating} out of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className="relative w-4 h-4">
        <StarIcon className="absolute inset-0 w-4 h-4 text-fg/15" />
        {rating >= i - 0.5 && (
          <span className="absolute inset-0 overflow-hidden" style={{ width: rating >= i ? "100%" : "50%" }}>
            <StarIcon className="w-4 h-4 text-amber-400" />
          </span>
        )}
      </span>
    ))}
  </span>
);

/* One person's review on a movie's own page: who, when, the stars, what they wrote and
the reactions. No poster, since the page already shows the movie at the top */
const ReviewNote = ({ review, movie }) => {
  const { user } = useAuth();
  const openShare = useShare();
  const today = useToday();
  const [editing, setEditing] = useState(false);
  const isMine = review.user_id === user?.id;
  const rating = Number(review.rating);

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4">
      <div className="flex items-center gap-2.5">
        <Link to={`/u/${review.author.username}`} className="shrink-0 rounded-full ring-2 ring-fg/10 hover:ring-brand/60 transition">
          <UserAvatar user={review.author} className="w-9" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5 leading-tight">
          <span className="flex min-w-0 items-center gap-1.5">
            <Link to={`/u/${review.author.username}`} className="truncate text-sm font-semibold text-fg hover:text-brand-soft">
              {review.author.name}
            </Link>
            {isMine && (
              <span className="shrink-0 rounded-full bg-brand/20 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-soft">
                You
              </span>
            )}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted" title={formatDay(review.watched_on, { full: true })}>
            <TicketIcon />
            Watched {relativeDay(review.watched_on, today)}
          </span>
        </div>
        {isMine && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              title="Share your review"
              aria-label="Share your review"
              onClick={() => openShare({ movie, rating: review.rating, review: review.review, author: review.author, reviewId: review.id })}
              className="grid h-8 w-8 place-items-center rounded-full text-soft hover:bg-fg/10 hover:text-fg"
            >
              <ShareIcon />
            </button>
            <button
              type="button"
              title="Edit your review"
              aria-label="Edit your review"
              onClick={() => setEditing(true)}
              className="grid h-8 w-8 place-items-center rounded-full text-amber-500 hover:bg-fg/10"
            >
              <PencilIcon />
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Stars rating={rating} />
        <span className="text-xs font-semibold tabular-nums text-amber-500">{rating} / 5</span>
      </div>

      {review.review && <p className="break-words text-[13px] leading-relaxed text-soft">{review.review}</p>}

      <ReactionBar review={review} />

      {editing && <ReviewModal movie={movie} onClose={() => setEditing(false)} />}
    </article>
  );
};

export default ReviewNote;
