import { useEffect, useRef } from "react";
import ShareReview from "./ShareReview";
import { CheckIcon } from "./icons";

/* Share a review: straight after writing it (justSaved), or later from its card */
const ShareReviewModal = ({ movie, rating, review, author, reviewId, justSaved = false, onClose }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current.showModal();
  }, []);

  return (
    <dialog ref={dialogRef} className="modal" onClose={onClose}>
      <div className="modal-box max-w-sm rounded-3xl bg-panel border border-line text-fg p-6">
        <form method="dialog">
          <button
            aria-label="Close"
            className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-muted hover:text-fg"
          >
            ✕
          </button>
        </form>
        {justSaved && (
          <p className="flex items-center gap-1.5 text-sm font-semibold text-agree">
            <CheckIcon className="h-3.5 w-3.5" />
            Review saved
          </p>
        )}
        <h3 className="pr-8 text-lg font-bold">{justSaved ? "Share it with your friends?" : "Share your review"}</h3>
        <p className="mt-1 mb-5 text-sm text-soft">Post it anywhere and invite friends to JustSeen.</p>
        <ShareReview movie={movie} rating={rating} review={review} author={author} reviewId={reviewId} />
        {justSaved && (
          <form method="dialog" className="mt-3 text-center">
            <button className="text-sm font-medium text-soft hover:text-fg">Not now</button>
          </form>
        )}
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ShareReviewModal;
