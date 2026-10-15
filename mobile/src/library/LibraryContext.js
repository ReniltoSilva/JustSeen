import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { deleteReview, getMyReviewSummaries, removeSharePicture, saveReview } from "../data/reviews";
import { follow, getFollowingIds, unfollow } from "../data/people";
import { addToWatchlist, getWatchlist, removeFromWatchlist } from "../data/watchlist";
import { getTitleDetails } from "../lib/tmdb";
import { sameTitle, titleKey } from "../../../shared/titles";

/* "My library", like the website's LibraryContext: the movies and shows I've reviewed, my
watchlist and the people I follow, loaded once and shared by every screen. `version`
goes up whenever they change, so screens that list reviews know to reload */
const LibraryContext = createContext(null);

/* A fresh library per logged-in user (the key), so one account's data never
shows up for the next person who logs in on the same phone */
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
  /* ready: everything above has loaded. The review form waits for it */
  const [ready, setReady] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoadFailed(false);
    Promise.all([getMyReviewSummaries(userId), getWatchlist(userId), getFollowingIds(userId)])
      .then(([reviews, list, following]) => {
        if (cancelled) return;
        setMyReviews(new Map(reviews.map((review) => [titleKey(review), review])));
        setWatchlist(list);
        setFollowingIds(new Set(following));
        setReady(true);
      })
      .catch((error) => {
        console.error("Failed to load your library:", error);
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, attempt]);

  /* Try loading again, after it failed (e.g. no connection) */
  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  /* Save (add or edit) my review of a movie or show */
  const saveMyReview = useCallback(
    async (movie, { rating, review, watchedOn }) => {
      const existing = myReviews.get(titleKey(movie));

      /* Runtime is only needed for Year in Film stats, so a TMDB hiccup shouldn't block saving.
      Shows have no single runtime, so theirs stays empty */
      let runtime = existing?.runtime ?? movie.runtime ?? null;
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

  const deleteMyReview = useCallback(
    async (item) => {
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
    },
    [myReviews, userId],
  );

  const isSaved = useCallback((item) => watchlist.some((entry) => sameTitle(entry, item)), [watchlist]);

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
      loadFailed,
      reload,
      version,
      myReviews,
      /* My review of a movie or show ({ media_type, movie_id }), if I wrote one */
      myReviewFor: (item) => myReviews.get(titleKey(item)),
      saveMyReview,
      deleteMyReview,
      watchlist,
      isSaved,
      toggleWatchlist,
      followingIds,
      isFollowing: (personId) => followingIds.has(personId),
      toggleFollow,
    }),
    [ready, loadFailed, reload, version, myReviews, saveMyReview, deleteMyReview, watchlist, isSaved, toggleWatchlist, followingIds, toggleFollow],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
};

export const useLibrary = () => useContext(LibraryContext);
