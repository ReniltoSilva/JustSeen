import { supabase, unwrap } from "../lib/supabase";
import { rankSuggestions } from "../lib/suggestions";

/* Ids of everyone this person follows */
export const getFollowingIds = async (userId) => {
  const rows = unwrap(
    await supabase.from("follows").select("following_id").eq("follower_id", userId),
  );
  return rows.map((row) => row.following_id);
};

/* People this person follows, newest first */
export const getFollowing = async (userId) => {
  const rows = unwrap(
    await supabase
      .from("follows")
      .select("created_at, profile:profiles!follows_following_id_fkey(*)")
      .eq("follower_id", userId)
      .order("created_at", { ascending: false }),
  );
  return rows.map((row) => row.profile);
};

/* People who follow this person, newest first */
export const getFollowers = async (userId) => {
  const rows = unwrap(
    await supabase
      .from("follows")
      .select("created_at, profile:profiles!follows_follower_id_fkey(*)")
      .eq("following_id", userId)
      .order("created_at", { ascending: false }),
  );
  return rows.map((row) => row.profile);
};

export const getFollowCounts = async (userId) => {
  const [following, followers] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", userId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", userId),
  ]);
  if (following.error) throw following.error;
  if (followers.error) throw followers.error;
  return { following: following.count ?? 0, followers: followers.count ?? 0 };
};

export const follow = async (myId, theirId) =>
  unwrap(await supabase.from("follows").insert({ follower_id: myId, following_id: theirId }));

export const unfollow = async (myId, theirId) =>
  unwrap(
    await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", theirId),
  );

/* People I might want to follow, ranked by shared/suggestions.js: followed by people I
follow, or who reviewed the same movies and shows as me (my 100 latest). With little to
go on, the newest accounts fill the list. myReviews: my reviews from the library */
export const getSuggestions = async (myId, followingIds, myReviews, limit = 12) => {
  const latest = [...myReviews].sort((a, b) => b.watched_on.localeCompare(a.watched_on)).slice(0, 100);
  const titleIds = [...new Set(latest.map((review) => review.movie_id))];

  const [friendFollows, sameTitleReviews] = await Promise.all([
    followingIds.length === 0
      ? []
      : supabase
          .from("follows")
          .select("following_id, profile:profiles!follows_following_id_fkey(*)")
          .in("follower_id", followingIds)
          .then(unwrap),
    titleIds.length === 0
      ? []
      : supabase
          .from("reviews")
          .select("user_id, media_type, movie_id, title, rating, author:profiles!reviews_user_id_fkey(*)")
          .in("movie_id", titleIds)
          .neq("user_id", myId)
          .limit(1000)
          .then(unwrap),
  ]);

  const ranked = rankSuggestions({ myId, followingIds, friendFollows, sameTitleReviews, myReviews: latest, limit });
  if (ranked.length >= 4) return ranked;

  const skip = new Set([myId, ...followingIds, ...ranked.map((entry) => entry.profile.id)]);
  const newest = unwrap(
    await supabase
      .from("profiles")
      .select("*")
      .eq("needs_setup", false) // half-made Google accounts have no real name yet
      .order("created_at", { ascending: false })
      .limit(limit + skip.size),
  );
  const extra = newest.filter((profile) => !skip.has(profile.id)).map((profile) => ({ profile, mutual: 0, inCommon: 0 }));
  return [...ranked, ...extra].slice(0, limit);
};
