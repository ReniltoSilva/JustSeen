import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import Avatar, { AvatarRing } from "./Avatar";
import ReactionBar from "./ReactionBar";
import { colors } from "../lib/theme";
import { posterUrl } from "../lib/tmdb";
import { movieOf, openMovie, openProfile, openReview } from "../lib/navigation";
import { genreName } from "../../../shared/genres";
import { relativeDay, releaseYear } from "../../../shared/dates";

/* One review, laid out like the website's MovieCard. Tap the person for their
profile, the poster or title for the movie; my own reviews have an Edit button */
const ReviewCard = ({ review }) => {
  const { user } = useAuth();
  const isMine = review.user_id === user?.id;
  const genres = (review.genre_ids ?? []).filter((id) => genreName(id)).slice(0, 3);

  return (
    <View style={styles.card}>
      {/* Who watched it and when */}
      <View style={styles.header}>
        <Pressable
          onPress={() => review.author && openProfile(review.author.username)}
          style={({ pressed }) => [styles.who, pressed && { opacity: 0.7 }]}
        >
          <AvatarRing color="rgba(255,255,255,0.1)">
            <Avatar user={review.author} size={36} />
          </AvatarRing>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {review.author?.name}
              </Text>
              {isMine && <Text style={styles.youBadge}>YOU</Text>}
            </View>
            <View style={styles.whenRow}>
              <Ionicons name="eye-outline" size={13} color={colors.muted} />
              <Text style={styles.when}>Watched {relativeDay(review.watched_on)}</Text>
            </View>
          </View>
        </Pressable>
        {isMine && (
          <Pressable onPress={() => openReview(movieOf(review))} hitSlop={10} style={styles.edit} accessibilityLabel="Edit your review">
            <Ionicons name="create-outline" size={16} color={colors.soft} />
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
        )}
      </View>

      {/* Poster, fading into the card at the bottom */}
      <Pressable onPress={() => openMovie(review.movie_id)} style={styles.poster} accessibilityLabel={`Open ${review.title}`}>
        <Image source={posterUrl(review.poster_path)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <LinearGradient colors={["transparent", colors.panel]} style={styles.posterFade} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2} onPress={() => openMovie(review.movie_id)}>
            {review.title}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="star" size={12} color={colors.star} />
            <Text style={styles.rating}>{Number(review.rating)}</Text>
            <Text style={styles.year}>{releaseYear(review.release_date)}</Text>
          </View>
        </View>

        {genres.length > 0 && (
          <View style={styles.genres}>
            {genres.map((id) => (
              <Text key={id} style={styles.genre}>
                {genreName(id)}
              </Text>
            ))}
          </View>
        )}

        {review.review ? <Text style={styles.review}>{review.review}</Text> : null}

        <ReactionBar review={review} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.panel,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  who: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { flex: 1, gap: 2 },
  edit: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.panel2 },
  editText: { color: colors.soft, fontSize: 13, fontWeight: "600" },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { color: colors.fg, fontSize: 14, fontWeight: "600", flexShrink: 1 },
  youBadge: {
    color: colors.brandSoft,
    backgroundColor: "rgba(124,92,255,0.2)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  whenRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  when: { color: colors.muted, fontSize: 12 },
  poster: { aspectRatio: 2 / 3, backgroundColor: colors.panel2 },
  posterFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "33%" },
  body: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { color: colors.fg, fontSize: 15, fontWeight: "600", flex: 1, lineHeight: 20 },
  meta: { flexDirection: "row", alignItems: "center", gap: 3, paddingTop: 2 },
  rating: { color: colors.star, fontSize: 12, fontWeight: "700", marginRight: 6 },
  year: { color: colors.muted, fontSize: 12 },
  genres: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  genre: {
    color: colors.soft,
    fontSize: 11,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  review: { color: colors.soft, fontSize: 13, lineHeight: 20, marginTop: 10 },
});

export default ReviewCard;
