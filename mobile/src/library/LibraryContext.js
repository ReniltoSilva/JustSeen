import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { deleteReview, getMyReviewSummaries, removeSharePicture, saveReview } from "../data/reviews";
import { getMovieDetails } from "../lib/tmdb";

/* "My library", like the website's LibraryContext: the movies I've reviewed, loaded
once and shared by every screen. `version` goes up whenever my reviews change, so
the feed knows to reload. (The watchlist and follows join it in a later step) */
const LibraryContext = createContext(null);

/* A fresh library per logged-in user (the key), so one account's reviews never
show up for the next person who logs in on the same phone */
export const LibraryProvider = ({ children }) => {
  const { user } = useAuth();
  return (
    <LibraryStore key={user?.id ?? "logged-out"} userId={user?.id}>
      {children}
    </LibraryStore>
  );
};

const LibraryStore = ({ userId, children }) => {
  const [myReviews, setMyReviews] = useState(new Map()); // movie_id -> my review
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    getMyReviewSummaries(userId)
      .then((reviews) => {
        if (!cancelled) setMyReviews(new Map(reviews.map((review) => [review.movie_id, review])));
      })
      .catch((error) => console.error("Failed to load your reviews:", error));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* Save (add or edit) my review of a movie */
  const saveMyReview = useCallback(
    async (movie, { rating, review, watchedOn }) => {
      const existing = myReviews.get(movie.movie_id);

      /* Runtime is only needed for Year in Film stats, so a TMDB hiccup shouldn't block saving */
      let runtime = existing?.runtime ?? movie.runtime ?? null;
      if (runtime == null) {
        runtime = await getMovieDetails(movie.movie_id)
          .then((details) => details.runtime || null)
          .catch(() => null);
      }

      const saved = await saveReview({
        user_id: userId,
        movie_id: movie.movie_id,
        title: movie.title,
        poster_path: movie.poster_path,
        overview: movie.overview,
        genre_ids: movie.genre_ids,
        release_date: movie.release_date,
        runtime,
        rating,
        review: review.trim(),
        watched_on: watchedOn,
      });

      setMyReviews((prev) => new Map(prev).set(saved.movie_id, saved));
      setVersion((v) => v + 1);
      return saved;
    },
    [userId, myReviews],
  );

  const deleteMyReview = useCallback(
    async (movieId) => {
      const existing = myReviews.get(movieId);
      if (!existing) return;
      await deleteReview(existing.id);
      /* Its share link already stops working; tidy away the preview picture too */
      removeSharePicture(userId, existing.id).catch((error) => console.error("Failed to remove share picture:", error));
      setMyReviews((prev) => {
        const next = new Map(prev);
        next.delete(movieId);
        return next;
      });
      setVersion((v) => v + 1);
    },
    [myReviews, userId],
  );

  const value = useMemo(
    () => ({
      version,
      myReviewFor: (movieId) => myReviews.get(movieId),
      saveMyReview,
      deleteMyReview,
    }),
    [version, myReviews, saveMyReview, deleteMyReview],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => useContext(LibraryContext);
