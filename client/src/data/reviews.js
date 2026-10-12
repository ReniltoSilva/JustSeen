import { supabase, unwrap } from "../lib/supabase";

/* A review together with who wrote it and everyone's reactions (and who they are) */
const reviewSelect =
  "*, author:profiles!reviews_user_id_fkey(*), reactions(user_id, kind, profile:profiles!reactions_user_id_fkey(id, username, name, avatar))";

const newestFirst = (request) =>
  request.order("watched_on", { ascending: false }).order("created_at", { ascending: false });

/* Reviews by me and the people I follow */
export const getFeed = async (userIds, limit = 100) => {
  if (userIds.length === 0) return [];
  return unwrap(
    await newestFirst(supabase.from("reviews").select(reviewSelect).in("user_id", userIds)).limit(limit),
  );
};

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

/* Add or update: (user_id, movie_id) is unique, so saving twice edits the same review */
export const saveReview = async (review) =>
  unwrap(
    await supabase
      .from("reviews")
      .upsert(review, { onConflict: "user_id,movie_id" })
      .select(reviewSelect)
      .single(),
  );

export const deleteReview = async (reviewId) =>
  unwrap(await supabase.from("reviews").delete().eq("id", reviewId));

/* How many movies each person has reviewed: { userId: count } */
export const getReviewCounts = async (userIds) => {
  if (userIds.length === 0) return {};
  const rows = unwrap(await supabase.from("reviews").select("user_id").in("user_id", userIds));
  const counts = {};
  for (const row of rows) counts[row.user_id] = (counts[row.user_id] ?? 0) + 1;
  return counts;
};
