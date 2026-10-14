import { supabase, unwrap } from "../lib/supabase";

/* The same queries as the website's data/reviews.js and data/sharing.js */

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
