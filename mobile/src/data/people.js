import { supabase, unwrap } from "../lib/supabase";

/* The same queries as the website's data/profiles.js and data/follows.js */

export const getProfileByUsername = async (username) =>
  unwrap(await supabase.from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle());

/* Ids of everyone this person follows */
export const getFollowingIds = async (userId) => {
  const rows = unwrap(await supabase.from("follows").select("following_id").eq("follower_id", userId));
  return rows.map((row) => row.following_id);
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
  unwrap(await supabase.from("follows").delete().eq("follower_id", myId).eq("following_id", theirId));

/* Find people by username or name */
export const searchProfiles = async (query, { excludeId } = {}) => {
  const term = query.trim().replace(/[%_,()]/g, "");
  if (!term) return [];
  let request = supabase
    .from("profiles")
    .select("*")
    .or(`username.ilike.%${term}%,name.ilike.%${term}%`)
    .order("username")
    .limit(20);
  if (excludeId) request = request.neq("id", excludeId);
  return unwrap(await request);
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

/* People followed by the people I follow, that I don't follow yet, most shared first */
export const getSuggestions = async (myId, followingIds, limit = 10) => {
  if (followingIds.length === 0) return [];
  const rows = unwrap(
    await supabase
      .from("follows")
      .select("following_id, profile:profiles!follows_following_id_fkey(*)")
      .in("follower_id", followingIds),
  );

  const counts = new Map();
  for (const row of rows) {
    if (row.following_id === myId || followingIds.includes(row.following_id)) continue;
    const entry = counts.get(row.following_id) ?? { profile: row.profile, mutual: 0 };
    entry.mutual += 1;
    counts.set(row.following_id, entry);
  }
  return [...counts.values()].sort((a, b) => b.mutual - a.mutual).slice(0, limit);
};

export const isUsernameAvailable = async (username) =>
  unwrap(await supabase.rpc("username_available", { candidate: username }));

export const updateProfile = async (id, changes) =>
  unwrap(await supabase.from("profiles").update(changes).eq("id", id).select().single());
