import { useEffect, useRef } from "react";
import ShareReview from "./ShareReview";

/* Share one of my earlier reviews (opened from its card) */
const ShareReviewModal = ({ movie, review, onClose }) => {
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
        <h3 className="pr-8 text-lg font-bold">Share your review</h3>
        <p className="mt-1 mb-5 text-sm text-soft">Post it anywhere and invite friends to JustSeen.</p>
        <ShareReview movie={movie} rating={review.rating} review={review.review} author={review.author} />
      </div>

      <form method="dialog" className="modal-backdrop">
        <button>close</button>
      </form>
    </dialog>
  );
};

export default ShareReviewModal;
