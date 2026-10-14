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
