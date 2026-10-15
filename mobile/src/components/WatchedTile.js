import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { openTitle } from "../lib/navigation";
import { posterUrl } from "../lib/tmdb";
import { colors } from "../lib/theme";
import { useToday } from "../lib/useToday";
import PosterActions from "./PosterActions";
import { relativeDay, releaseYear } from "../../../shared/dates";
import { isShow } from "../../../shared/titles";

const reactionKinds = [
  { kind: "agree", icon: "thumbs-up", color: colors.agree },
  { kind: "unsure", icon: "remove-circle", color: colors.unsure },
  { kind: "disagree", icon: "thumbs-down", color: colors.disagree },
];

/* One watched movie or show in a two-column grid: the poster with the website's quick
actions, then the title with its rating, the year and when, the review and its
reaction counts */
const WatchedTile = ({ review }) => {
  const today = useToday();
  const reactions = review.reactions ?? [];
  const count = (kind) => reactions.filter((reaction) => reaction.kind === kind).length;

  return (
    <View style={styles.tile}>
      <Pressable onPress={() => openTitle(review)} style={({ pressed }) => [styles.poster, pressed && { opacity: 0.85 }]}>
        <Image source={posterUrl(review.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <PosterActions review={review} />
      </Pressable>

      <View style={styles.titleRow}>
        <Text style={styles.title} numberOfLines={2}>
          {review.title}
        </Text>
        <View style={styles.rating} accessibilityLabel={`Rated ${Number(review.rating)} out of 5`}>
          <Ionicons name="star" size={13} color={colors.star} />
          <Text style={styles.ratingText}>{Number(review.rating)}</Text>
        </View>
      </View>
      <Text style={styles.meta} numberOfLines={1}>
        {[isShow(review) && "TV show", releaseYear(review.release_date), `watched ${relativeDay(review.watched_on, today)}`]
          .filter(Boolean)
          .join(" · ")}
      </Text>
      {review.review ? (
        <Text style={styles.review} numberOfLines={5}>
          {review.review}
        </Text>
      ) : null}
      <View style={styles.reactions}>
        {reactionKinds.map(({ kind, icon, color }) => (
          <View key={kind} style={styles.reaction}>
            <Ionicons name={count(kind) ? icon : `${icon}-outline`} size={12} color={color} />
            <Text style={[styles.reactionCount, { color }]}>{count(kind)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { flex: 1, maxWidth: "50%", marginBottom: 22, gap: 3 },
  poster: { aspectRatio: 2 / 3, borderRadius: 12, overflow: "hidden", backgroundColor: colors.panel2, marginBottom: 5 },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  title: { flex: 1, color: colors.fg, fontSize: 14, fontWeight: "700", lineHeight: 18 },
  rating: { flexDirection: "row", alignItems: "center", gap: 2, paddingTop: 1 },
  ratingText: { color: colors.star, fontSize: 13, fontWeight: "800" },
  meta: { color: colors.muted, fontSize: 11 },
  review: { color: colors.soft, fontSize: 12, lineHeight: 17, marginTop: 3 },
  reactions: { flexDirection: "row", gap: 10, marginTop: 5 },
  reaction: { flexDirection: "row", alignItems: "center", gap: 3 },
  reactionCount: { fontSize: 11, fontWeight: "600" },
});

export default WatchedTile;
