import { useEffect, useId, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { useShare } from "../share/ShareContext";
import { useToday } from "../lib/useToday";
import { posterUrl } from "../lib/tmdb";

/* Short enough that cards can always show the whole review (the database checks it too) */
const maxReviewLength = 250;

const starValues = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

/* Write, edit or delete my review of a movie. Waits for my reviews to load first, so
it knows whether I already reviewed this one (otherwise an old review would open as a
new one and be saved with today's date) */
const ReviewModal = ({ movie, onClose }) => {
  const { ready } = useLibrary();
  return ready ? <ReviewDialog movie={movie} onClose={onClose} /> : <LoadingDialog onClose={onClose} />;
};

const LoadingDialog = ({ onClose }) => {
  const dialogRef = useRef(null);
  useEffect(() => {
    dialogRef.current.showModal();
  }, []);
  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-lg rounded-3xl bg-panel border border-line text-fg p-8 text-center text-soft">
        <span className="loading loading-spinner text-brand" aria-label="Loading your reviews" />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

const ReviewDialog = ({ movie, onClose }) => {
  const dialogRef = useRef(null);
  const ratingName = useId();
  const { user } = useAuth();
  const openShare = useShare();
  const { myReviewFor, saveMyReview, deleteMyReview } = useLibrary();
  const existing = myReviewFor(movie.movie_id);

  const [rating, setRating] = useState(Number(existing?.rating) || 0);
  const [review, setReview] = useState(existing?.review ?? "");
  const today = useToday();
  const [watchedOn, setWatchedOn] = useState(existing?.watched_on ?? today);
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  const close = () => dialogRef.current.close();

  const save = async (e) => {
    e.preventDefault();
    if (!rating || !watchedOn) return;

    setSaving(true);
    setError("");
    try {
      const saved = await saveMyReview(movie, { rating, review, watchedOn });
      close();
      /* A brand-new review: offer to share it (edits just close) */
      if (!existing) openShare({ movie, rating, review, author: user, reviewId: saved.id, justSaved: true });
    } catch (err) {
      console.error("Failed to save review:", err);
      setError("Couldn't save your review. Check your connection and try again.");
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError("");
    try {
      await deleteMyReview(movie.movie_id);
      close();
    } catch (err) {
      console.error("Failed to delete review:", err);
      setError("Couldn't delete your review. Try again.");
      setSaving(false);
    }
  };

  const poster = posterUrl(movie.poster_path, "w154");

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-lg rounded-3xl bg-panel border border-line text-fg p-6 sm:p-8">
        <form method="dialog">
          <button
            aria-label="Close"
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-muted hover:text-fg"
          >
            ✕
          </button>
        </form>

        <div className="flex items-center gap-4 pr-8">
          {poster && (
            <img src={poster} alt="" className="w-14 aspect-[2/3] rounded-lg object-cover shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted">
              {existing ? "Edit your review" : "Your review"}
            </p>
            <h3 className="font-bold text-lg leading-snug">{movie.title}</h3>
          </div>
        </div>

        <form onSubmit={save} className="flex flex-col gap-6 mt-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Rating</span>
            <div className="flex items-center gap-4">
              <div className="rating rating-lg rating-half">
                <input
                  type="radio"
                  name={ratingName}
                  className="rating-hidden"
                  checked={rating === 0}
                  onChange={() => setRating(0)}
                  aria-label="No rating"
                />
                {starValues.map((value) => (
                  <input
                    key={value}
                    type="radio"
                    name={ratingName}
                    className={`mask mask-star-2 bg-amber-400 ${value % 1 ? "mask-half-1" : "mask-half-2"}`}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                    aria-label={`${value} star`}
                  />
                ))}
              </div>
              <span className="text-sm text-soft">{rating ? `${rating} / 5` : "Pick a rating"}</span>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Date watched
            </span>
            <input
              type="date"
              required
              max={today}
              value={watchedOn}
              onChange={(e) => setWatchedOn(e.target.value)}
              className="input w-full sm:w-56 h-11 rounded-xl bg-ink border-line text-fg focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">Review</span>
            <textarea
              className="textarea w-full h-40 rounded-2xl bg-ink border-line text-fg text-[15px] leading-relaxed p-4 placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
              placeholder="What did you think?"
              maxLength={maxReviewLength}
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
            <span
              className={`text-xs self-end tabular-nums ${
                review.length >= maxReviewLength
                  ? "text-disagree"
                  : review.length >= maxReviewLength - 30
                    ? "text-amber-500"
                    : "text-muted"
              }`}
              aria-live="polite"
            >
              {review.length} / {maxReviewLength}
            </span>
          </label>

          {error && <p className="text-sm text-disagree">{error}</p>}

          {confirmingDelete ? (
            <div className="flex flex-col gap-3 rounded-2xl bg-disagree/10 p-4 ring-1 ring-disagree/20">
              <p className="text-sm text-fg">Delete your review of {movie.title}? Its reactions go too.</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="flex-1 rounded-full bg-fg/[0.06] py-2 text-sm font-medium text-fg hover:bg-fg/10"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={remove}
                  disabled={saving}
                  className="flex-1 rounded-full bg-disagree py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                  {saving ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {existing && (
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="mr-auto rounded-full px-3 py-2 text-sm font-medium text-disagree hover:bg-disagree/10"
                >
                  Delete review
                </button>
              )}
              <button
                type="button"
                className="ml-auto btn shadow-none rounded-full px-5 border-line-strong bg-transparent text-fg hover:bg-panel-2"
                onClick={close}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn shadow-none rounded-full px-6 bg-brand hover:bg-brand-hover text-white border-none disabled:bg-panel-2 disabled:text-muted"
                disabled={!rating || !watchedOn || saving}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ReviewModal;
