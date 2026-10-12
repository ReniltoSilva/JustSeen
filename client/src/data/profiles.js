import { supabase, unwrap } from "../lib/supabase";

export const getProfileByUsername = async (username) =>
  unwrap(await supabase.from("profiles").select("*").eq("username", username.toLowerCase()).maybeSingle());

export const getProfilesByIds = async (ids) => {
  if (ids.length === 0) return [];
  return unwrap(await supabase.from("profiles").select("*").in("id", ids));
};

/* Find people by username or name, for the "Find people" search */
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

export const isUsernameAvailable = async (username) =>
  unwrap(await supabase.rpc("username_available", { candidate: username }));

export const updateProfile = async (id, changes) =>
  unwrap(await supabase.from("profiles").update(changes).eq("id", id).select().single());
