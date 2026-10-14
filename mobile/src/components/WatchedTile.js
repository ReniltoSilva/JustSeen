import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { movieOf, openMovie, openReview, openShare } from "../lib/navigation";
import { posterUrl } from "../lib/tmdb";
import { colors } from "../lib/theme";
import { useToday } from "../lib/useToday";
import { relativeDay, releaseYear } from "../../../shared/dates";

const reactionKinds = [
  { kind: "agree", icon: "thumbs-up", color: colors.agree },
  { kind: "unsure", icon: "remove-circle", color: colors.unsure },
  { kind: "disagree", icon: "thumbs-down", color: colors.disagree },
];

/* Round frosted button on the poster */
const PosterButton = ({ icon, label, onPress }) => (
  <Pressable onPress={onPress} hitSlop={6} accessibilityLabel={label} style={({ pressed }) => [styles.posterButton, pressed && { opacity: 0.7 }]}>
    <Ionicons name={icon} size={15} color="#fff" />
  </Pressable>
);

/* One watched movie in a two-column grid: the poster with the rating (and Share and
Edit on my own), then the title, year, when, the review and its reactions */
const WatchedTile = ({ review }) => {
  const { user } = useAuth();
  const today = useToday();
  const isMine = review.user_id === user?.id;
  const reactions = review.reactions ?? [];
  const count = (kind) => reactions.filter((reaction) => reaction.kind === kind).length;

  return (
    <View style={styles.tile}>
      <Pressable onPress={() => openMovie(review.movie_id)} style={({ pressed }) => [styles.poster, pressed && { opacity: 0.85 }]}>
        <Image source={posterUrl(review.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <View style={styles.rating}>
          <Ionicons name="star" size={11} color={colors.star} />
          <Text style={styles.ratingText}>{Number(review.rating)}</Text>
        </View>
        {isMine && (
          <View style={styles.posterButtons}>
            <PosterButton
              icon="share-social-outline"
              label="Share your review"
              onPress={() =>
                openShare({ reviewId: review.id, movie: movieOf(review), rating: review.rating, review: review.review, author: review.author ?? user })
              }
            />
            <PosterButton icon="create-outline" label="Edit your review" onPress={() => openReview(movieOf(review))} />
          </View>
        )}
      </Pressable>

      <Text style={styles.title} numberOfLines={2}>
        {review.title}
      </Text>
      <Text style={styles.meta} numberOfLines={1}>
        {[releaseYear(review.release_date), `watched ${relativeDay(review.watched_on, today)}`].filter(Boolean).join(" · ")}
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
  rating: {
    position: "absolute",
    top: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(9,9,13,0.75)",
  },
  ratingText: { color: colors.fg, fontSize: 12, fontWeight: "700" },
  posterButtons: { position: "absolute", top: 6, right: 6, gap: 6 },
  posterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,9,13,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  title: { color: colors.fg, fontSize: 14, fontWeight: "700", lineHeight: 18 },
  meta: { color: colors.muted, fontSize: 11 },
  review: { color: colors.soft, fontSize: 12, lineHeight: 17, marginTop: 3 },
  reactions: { flexDirection: "row", gap: 10, marginTop: 5 },
  reaction: { flexDirection: "row", alignItems: "center", gap: 3 },
  reactionCount: { fontSize: 11, fontWeight: "600" },
});

export default WatchedTile;
