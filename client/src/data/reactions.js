import { supabase, unwrap } from "../lib/supabase";

/* Set my reaction on a review, or remove it with kind = null.
The database writes (or removes) the notification for the reviewer itself */
export const setReaction = async (userId, reviewId, kind) => {
  if (!kind) {
    return unwrap(
      await supabase.from("reactions").delete().eq("review_id", reviewId).eq("user_id", userId),
    );
  }
  return unwrap(
    await supabase
      .from("reactions")
      .upsert({ review_id: reviewId, user_id: userId, kind }, { onConflict: "review_id,user_id" }),
  );
};
