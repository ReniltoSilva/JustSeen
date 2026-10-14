import { supabase, unwrap } from "../lib/supabase";
import { siteUrl } from "../lib/site";

/* The same as the website's data/sharing.js */

/* Each shared review has its own page: justseenapp.com/r/<review id> */
export const reviewLink = (reviewId) => `${siteUrl}/r/${reviewId}`;

/* The text that goes with the link (same words as the website) */
export const shareText = ({ movie, rating }) =>
  `I gave ${movie.title} ${Number(rating)}/5 on JustSeen. Movies are better with friends, join me:`;

/* "/9j/4AAQ..." (base64) -> the bytes, for uploading */
const base64ToBytes = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

/* The wide preview picture apps show for that link, kept in the public share-cards
folder under my own user id (the storage rules only allow that) */
export const uploadSharePicture = async (userId, reviewId, jpegBase64) =>
  unwrap(
    await supabase.storage
      .from("share-cards")
      .upload(`${userId}/${reviewId}.jpg`, base64ToBytes(jpegBase64), {
        upsert: true,
        contentType: "image/jpeg",
        cacheControl: "300",
      }),
  );

/* From now on anyone with the link can see this review (see 0005_shared_review_links.sql) */
export const markShared = async (reviewId) =>
  unwrap(await supabase.from("reviews").update({ shared_at: new Date().toISOString() }).eq("id", reviewId));
