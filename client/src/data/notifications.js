import { supabase, unwrap } from "../lib/supabase";

export const getNotifications = async (limit = 30) =>
  unwrap(
    await supabase
      .from("notifications")
      .select(
        "*, actor:profiles!notifications_actor_id_fkey(id, username, name, avatar), review:reviews(id, movie_id, title, poster_path)",
      )
      .order("created_at", { ascending: false })
      .limit(limit),
  );

export const markAllRead = async (userId) =>
  unwrap(
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("recipient_id", userId)
      .eq("read", false),
  );

/* Calls onChange whenever one of my notifications is added, changed or removed.
Returns a function that stops listening */
export const subscribeToNotifications = (userId, onChange) => {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "notifications", filter: `recipient_id=eq.${userId}` },
      onChange,
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};
