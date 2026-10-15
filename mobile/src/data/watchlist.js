import { supabase, unwrap } from "../lib/supabase";

/* The same queries as the website's data/watchlist.js */

export const getWatchlist = async (userId) =>
  unwrap(await supabase.from("watchlist").select("*").eq("user_id", userId).order("created_at", { ascending: false }));

export const addToWatchlist = async (userId, movie) => {
  const { media_type = "movie", movie_id, title, poster_path, overview, genre_ids, release_date } = movie;
  return unwrap(
    await supabase
      .from("watchlist")
      .upsert(
        { user_id: userId, media_type, movie_id, title, poster_path, overview, genre_ids, release_date },
        { onConflict: "user_id,media_type,movie_id", ignoreDuplicates: true },
      ),
  );
};

export const removeFromWatchlist = async (userId, { media_type = "movie", movie_id }) =>
  unwrap(await supabase.from("watchlist").delete().eq("user_id", userId).eq("media_type", media_type).eq("movie_id", movie_id));
