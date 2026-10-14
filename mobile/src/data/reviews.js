import { supabase, unwrap } from "../lib/supabase";

/* The same queries as the website's data/reviews.js and data/sharing.js */

/* A review together with who wrote it and everyone's reactions (and who they are) */
const reviewSelect =
  "*, author:profiles!reviews_user_id_fkey(*), reactions(user_id, kind, profile:profiles!reactions_user_id_fkey(id, username, name, avatar))";

const newestFirst = (request) =>
  request.order("watched_on", { ascending: false }).order("created_at", { ascending: false });

/* Reviews by me and the people I follow */
export const getFeed = async (userIds, limit = 100) => {
  if (userIds.length === 0) return [];
  return unwrap(await newestFirst(supabase.from("reviews").select(reviewSelect).in("user_id", userIds)).limit(limit));
};

/* Everything one person reviewed */
export const getUserReviews = async (userId) =>
  unwrap(await newestFirst(supabase.from("reviews").select(reviewSelect).eq("user_id", userId)));

/* Everyone's reviews of one movie */
export const getMovieReviews = async (movieId) =>
  unwrap(await newestFirst(supabase.from("reviews").select(reviewSelect).eq("movie_id", movieId)));

/* Only what's needed to know "did I watch this?" across the app */
export const getMyReviewSummaries = async (userId) =>
  unwrap(
    await supabase
      .from("reviews")
      .select("id, movie_id, rating, review, watched_on, runtime, genre_ids")
      .eq("user_id", userId),
  );

/* Add or update: (user_id, movie_id) is unique, so saving twice edits the same review */
export const saveReview = async (review) =>
  unwrap(
    await supabase
      .from("reviews")
      .upsert(review, { onConflict: "user_id,movie_id" })
      .select("id, movie_id, rating, review, watched_on, runtime, genre_ids")
      .single(),
  );

export const deleteReview = async (reviewId) => unwrap(await supabase.from("reviews").delete().eq("id", reviewId));

/* A deleted review's share preview picture goes too (if it was ever shared) */
export const removeSharePicture = async (userId, reviewId) =>
  unwrap(await supabase.storage.from("share-cards").remove([`${userId}/${reviewId}.jpg`]));

/* Set my reaction on a review, or remove it with kind = null.
The database writes (or removes) the notification for the reviewer itself */
export const setReaction = async (userId, reviewId, kind) => {
  if (!kind) {
    return unwrap(await supabase.from("reactions").delete().eq("review_id", reviewId).eq("user_id", userId));
  }
  return unwrap(
    await supabase.from("reactions").upsert({ review_id: reviewId, user_id: userId, kind }, { onConflict: "review_id,user_id" }),
  );
};

/* Every preview picture of mine, for when the whole account is deleted */
export const removeAllSharePictures = async (userId) => {
  const files = unwrap(await supabase.storage.from("share-cards").list(userId, { limit: 1000 }));
  if (files.length === 0) return;
  unwrap(await supabase.storage.from("share-cards").remove(files.map((file) => `${userId}/${file.name}`)));
};

/* Reviews in one calendar year, for Year in Film */
export const getYearReviews = async (userId, year) =>
  unwrap(
    await supabase
      .from("reviews")
      .select("*, reactions(kind)")
      .eq("user_id", userId)
      .gte("watched_on", `${year}-01-01`)
      .lte("watched_on", `${year}-12-31`)
      .order("watched_on"),
  );
