import { supabase, unwrap } from "../lib/supabase";

/* The same queries as the website's data/reviews.js and data/follows.js.
(Next step: move these into /shared so both apps use one copy) */

const reviewSelect =
  "*, author:profiles!reviews_user_id_fkey(*), reactions(user_id, kind, profile:profiles!reactions_user_id_fkey(id, username, name, avatar))";

export const getFollowingIds = async (userId) => {
  const rows = unwrap(await supabase.from("follows").select("following_id").eq("follower_id", userId));
  return rows.map((row) => row.following_id);
};

/* Reviews by me and the people I follow, newest first */
export const getFeed = async (userIds, limit = 100) => {
  if (userIds.length === 0) return [];
  return unwrap(
    await supabase
      .from("reviews")
      .select(reviewSelect)
      .in("user_id", userIds)
      .order("watched_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
  );
};
