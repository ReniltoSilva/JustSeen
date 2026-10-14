import { forwardRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Avatar from "./Avatar";
import { posterUrl } from "../lib/tmdb";
import { siteUrl } from "../lib/site";
import { releaseYear } from "../../../shared/dates";

/* Drawn at half size (600 x 315) and saved at 1200 x 630 */
export const cardWidth = 600;
export const cardHeight = 315;

/* A friendly line under the name, based on the rating (same as the website) */
const verdict = (rating) => {
  if (rating >= 4) return "recommends this one";
  if (rating <= 2) return "wasn't a fan";
  return "watched this one";
};

/* The wide picture WhatsApp, X and Facebook show for a review's link: poster on the
left, the review on the right, like the website's drawLinkPreview. The share screen
photographs it with react-native-view-shot. `onPosterLoad` says when it's ready */
const LinkPreviewCard = forwardRef(({ movie, rating, review, author, onPosterLoad }, ref) => {
  const stars = Number(rating);
  const text = (review ?? "").trim();
  const poster = posterUrl(movie.poster_path, "w500");
  const year = releaseYear(movie.release_date);

  return (
    <View ref={ref} collapsable={false} style={styles.card}>
      {/* Background: the poster's colours, blurred and darkened */}
      {poster && <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={30} />}
      <LinearGradient colors={["rgba(11,10,20,0.6)", "rgba(11,10,20,0.9)"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={["rgba(124,92,255,0)", "rgba(124,92,255,0.35)"]} start={{ x: 0.4, y: 0.4 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />

      <View style={styles.poster}>
        {poster && <Image source={poster} style={StyleSheet.absoluteFill} contentFit="cover" onLoad={onPosterLoad} onError={onPosterLoad} />}
      </View>

      <View style={styles.column}>
        <View style={styles.who}>
          <Avatar user={author} size={30} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>
              {author?.name}
            </Text>
            <Text style={styles.verdict}>{verdict(stars)}</Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2} adjustsFontSizeToFit minimumFontScale={0.7}>
          {movie.title}
        </Text>

        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Ionicons key={i} name={stars >= i ? "star" : stars >= i - 0.5 ? "star-half" : "star-outline"} size={20} color="#fbbf24" />
          ))}
          <Text style={styles.ratingText}>{stars} / 5</Text>
          {year ? <Text style={styles.year}>· {year}</Text> : null}
        </View>

        {text ? (
          <Text style={styles.review} numberOfLines={4}>
            “{text}”
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        <View style={styles.footer}>
          <Text style={styles.brand}>JustSeen</Text>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Join me on {siteUrl.replace("https://", "")}</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

const edge = 28;
const posterHeight = cardHeight - edge * 2;

const styles = StyleSheet.create({
  card: { width: cardWidth, height: cardHeight, backgroundColor: "#0b0a14", flexDirection: "row", padding: edge, gap: 24, overflow: "hidden" },
  poster: { width: Math.round((posterHeight * 2) / 3), height: posterHeight, borderRadius: 11, overflow: "hidden", backgroundColor: "#1a1825" },
  column: { flex: 1 },
  who: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: "#fff", fontSize: 14, fontWeight: "600" },
  verdict: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  title: { color: "#fff", fontSize: 27, fontWeight: "800", lineHeight: 29, marginTop: 14 },
  starsRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 8 },
  ratingText: { color: "#fbbf24", fontSize: 12, fontWeight: "600", marginLeft: 6 },
  year: { color: "rgba(255,255,255,0.55)", fontSize: 11, marginLeft: 4 },
  review: { flex: 1, color: "rgba(255,255,255,0.88)", fontSize: 13, lineHeight: 18, marginTop: 12 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  brand: { color: "#fff", fontSize: 15, fontWeight: "800" },
  pill: { backgroundColor: "#7c5cff", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "600" },
});

export default LinkPreviewCard;
