import { supabase, unwrap } from "../lib/supabase";

export const getWatchlist = async (userId) =>
  unwrap(
    await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  );

export const addToWatchlist = async (userId, movie) => {
  const { movie_id, title, poster_path, overview, genre_ids, release_date } = movie;
  return unwrap(
    await supabase
      .from("watchlist")
      .upsert(
        { user_id: userId, movie_id, title, poster_path, overview, genre_ids, release_date },
        { onConflict: "user_id,movie_id", ignoreDuplicates: true },
      ),
  );
};

export const removeFromWatchlist = async (userId, movieId) =>
  unwrap(await supabase.from("watchlist").delete().eq("user_id", userId).eq("movie_id", movieId));
