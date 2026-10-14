import { supabase, unwrap } from "../lib/supabase";
import { siteUrl } from "../lib/site";

/* Each shared review has its own page: justseenapp.com/r/<review id> */
export const reviewLink = (reviewId) => `${siteUrl}/r/${reviewId}`;

/* The wide preview picture apps show for that link, kept in the public share-cards
folder under my own user id (the storage rules only allow that) */
export const uploadSharePicture = async (userId, reviewId, blob) =>
  unwrap(
    await supabase.storage
      .from("share-cards")
      .upload(`${userId}/${reviewId}.jpg`, blob, { upsert: true, contentType: "image/jpeg", cacheControl: "300" }),
  );

/* From now on anyone with the link can see this review (see 0005_shared_review_links.sql) */
export const markShared = async (reviewId) =>
  unwrap(await supabase.from("reviews").update({ shared_at: new Date().toISOString() }).eq("id", reviewId));

/* When a review is deleted, its preview picture goes too (if it was ever shared) */
export const removeSharePicture = async (userId, reviewId) =>
  unwrap(await supabase.storage.from("share-cards").remove([`${userId}/${reviewId}.jpg`]));

/* Every preview picture of mine, for when the whole account is deleted */
export const removeAllSharePictures = async (userId) => {
  const files = unwrap(await supabase.storage.from("share-cards").list(userId, { limit: 1000 }));
  if (files.length === 0) return;
  unwrap(await supabase.storage.from("share-cards").remove(files.map((file) => `${userId}/${file.name}`)));
};
