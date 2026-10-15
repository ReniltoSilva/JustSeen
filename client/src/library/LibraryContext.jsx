import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getMyReviewSummaries, saveReview, deleteReview } from "../data/reviews";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../data/watchlist";
import { getFollowingIds, follow, unfollow } from "../data/follows";
import { getTitleDetails } from "../lib/tmdb";
import { sameTitle, titleKey } from "../lib/titles";
import { removeSharePicture } from "../data/sharing";

/* "My library": what I've reviewed, what's on my watchlist and who I follow.
Every card needs these, so they're loaded once here and shared, instead of each
page fetching its own copy. `version` goes up whenever my reviews change, so
pages that list reviews know to reload */
const LibraryContext = createContext(null);

/* A fresh library per logged-in user (the key), so one account's data can never
show up for the next person who logs in on the same device */
export const LibraryProvider = ({ children }) => {
  const { user } = useAuth();
  return (
    <LibraryStore key={user?.id ?? "logged-out"} userId={user?.id}>
      {children}
    </LibraryStore>
  );
};

const LibraryStore = ({ userId, children }) => {
  const [myReviews, setMyReviews] = useState(new Map()); // titleKey ("movie:438631") -> my review
  const [watchlist, setWatchlist] = useState([]);
  const [followingIds, setFollowingIds] = useState(new Set());
  const [version, setVersion] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    Promise.all([getMyReviewSummaries(userId), getWatchlist(userId), getFollowingIds(userId)])
      .then(([reviews, list, following]) => {
        if (cancelled) return;
        setMyReviews(new Map(reviews.map((review) => [titleKey(review), review])));
        setWatchlist(list);
        setFollowingIds(new Set(following));
        setReady(true);
      })
      .catch((error) => console.error("Failed to load your library:", error));
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const isSaved = useCallback(
    (item) => watchlist.some((entry) => sameTitle(entry, item)),
    [watchlist],
  );

  const toggleWatchlist = useCallback(
    async (movie) => {
      if (!userId) return;
      if (watchlist.some((entry) => sameTitle(entry, movie))) {
        await removeFromWatchlist(userId, movie);
        setWatchlist((prev) => prev.filter((entry) => !sameTitle(entry, movie)));
      } else {
        await addToWatchlist(userId, movie);
        setWatchlist((prev) => [{ ...movie, user_id: userId, created_at: new Date().toISOString() }, ...prev]);
      }
    },
    [userId, watchlist],
  );

  /* Save (add or edit) my review of a movie or show */
  const saveMyReview = useCallback(
    async (movie, { rating, review, watchedOn }) => {
      const existing = myReviews.get(titleKey(movie));

      /* Runtime is only needed for Year in Film stats, so a TMDB hiccup shouldn't block saving.
      Shows have no single runtime, so theirs stays empty */
      let runtime = existing?.runtime ?? null;
      if (runtime == null && movie.media_type !== "tv") {
        runtime = await getTitleDetails("movie", movie.movie_id)
          .then((details) => details.runtime || null)
          .catch(() => null);
      }

      const saved = await saveReview({
        user_id: userId,
        media_type: movie.media_type ?? "movie",
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

      setMyReviews((prev) => new Map(prev).set(titleKey(saved), saved));
      /* The database also takes it off the watchlist; mirror that here */
      setWatchlist((prev) => prev.filter((entry) => !sameTitle(entry, movie)));
      setVersion((v) => v + 1);
      return saved;
    },
    [userId, myReviews],
  );

  const deleteMyReview = useCallback(async (item) => {
    const existing = myReviews.get(titleKey(item));
    if (!existing) return;
    await deleteReview(existing.id);
    /* Its share link already stops working; tidy away the preview picture too */
    removeSharePicture(userId, existing.id).catch((error) => console.error("Failed to remove share picture:", error));
    setMyReviews((prev) => {
      const next = new Map(prev);
      next.delete(titleKey(item));
      return next;
    });
    setVersion((v) => v + 1);
  }, [myReviews, userId]);

  const toggleFollow = useCallback(
    async (personId) => {
      if (!userId || personId === userId) return;
      if (followingIds.has(personId)) {
        await unfollow(userId, personId);
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(personId);
          return next;
        });
      } else {
        await follow(userId, personId);
        setFollowingIds((prev) => new Set(prev).add(personId));
      }
      setVersion((v) => v + 1);
    },
    [userId, followingIds],
  );

  const value = useMemo(
    () => ({
      ready,
      version,
      myReviews,
      /* My review of a movie or show ({ media_type, movie_id }), if I wrote one */
      myReviewFor: (item) => myReviews.get(titleKey(item)),
      watchlist,
      isSaved,
      toggleWatchlist,
      saveMyReview,
      deleteMyReview,
      followingIds,
      isFollowing: (personId) => followingIds.has(personId),
      toggleFollow,
    }),
    [ready, version, myReviews, watchlist, isSaved, toggleWatchlist, saveMyReview, deleteMyReview, followingIds, toggleFollow],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLibrary = () => useContext(LibraryContext);
