import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import Avatar, { AvatarRing } from "./Avatar";
import ReactionBar from "./ReactionBar";
import PosterActions from "./PosterActions";
import { colors } from "../lib/theme";
import { posterUrl } from "../lib/tmdb";
import { openProfile, openTitle } from "../lib/navigation";
import { isShow } from "../../../shared/titles";
import { genreName } from "../../../shared/genres";
import { relativeDay, releaseYear } from "../../../shared/dates";
import { useToday } from "../lib/useToday";

/* Five small stars for a rating, with halves */
export const Stars = ({ rating, size = 14 }) => (
  <View style={styles.stars}>
    {[1, 2, 3, 4, 5].map((i) => (
      <Ionicons
        key={i}
        name={rating >= i ? "star" : rating >= i - 0.5 ? "star-half" : "star-outline"}
        size={size}
        color={rating >= i - 0.5 ? colors.star : colors.lineStrong}
      />
    ))}
  </View>
);

/* One review, laid out like the website's MovieCard. Tap the person for their
profile, the poster or title for the movie or show; the buttons next to their name review,
share or save it.
`compact` leaves the title out (poster, title, genres), for its own page */
const ReviewCard = ({ review, compact = false }) => {
  const { user } = useAuth();
  const isMine = review.user_id === user?.id;
  /* Redraws the card when the day changes, so "today" becomes "yesterday" */
  const today = useToday();
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
              <Ionicons name="ticket-outline" size={13} color={colors.muted} />
              <Text style={styles.when}>Watched {relativeDay(review.watched_on, today)}</Text>
            </View>
          </View>
        </Pressable>
        {/* The title's own page has these as big buttons already */}
        {!compact && <PosterActions review={review} inline />}
      </View>

      {compact ? (
        <View style={styles.body}>
          <View style={styles.compactRating}>
            <Stars rating={Number(review.rating)} />
            <Text style={styles.rating}>{Number(review.rating)} / 5</Text>
          </View>
          {review.review ? <Text style={styles.review}>{review.review}</Text> : null}
          <ReactionBar review={review} />
        </View>
      ) : (
        <>
      {/* The whole poster, framed by a blurred copy of itself and fading into the card */}
      <Pressable onPress={() => openTitle(review)} style={styles.poster} accessibilityLabel={`Open ${review.title}`}>
        <Image source={posterUrl(review.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={25} />
        <View style={styles.posterShade} />
        <Image source={posterUrl(review.poster_path)} style={styles.posterImage} contentFit="cover" transition={200} />
        <LinearGradient colors={["transparent", colors.panel]} style={styles.posterFade} />
      </Pressable>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2} onPress={() => openTitle(review)}>
            {review.title}
          </Text>
          <View style={styles.meta}>
            <Ionicons name="star" size={16} color={colors.star} />
            <Text style={styles.metaRating}>{Number(review.rating)}</Text>
            {isShow(review) && <Text style={styles.tvBadge}>TV</Text>}
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
        </>
      )}
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
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  who: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { flex: 1, gap: 2 },
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
  poster: { aspectRatio: 3 / 4, backgroundColor: colors.panel2, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  posterShade: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(9,9,13,0.45)" },
  posterImage: { height: "97%", aspectRatio: 2 / 3, borderRadius: 10 },
  stars: { flexDirection: "row", gap: 2 },
  compactRating: { flexDirection: "row", alignItems: "center", gap: 8 },
  posterFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: "8%" },
  body: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 12 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  title: { color: colors.fg, fontSize: 16, fontWeight: "700", flex: 1, lineHeight: 21 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, paddingTop: 1 },
  metaRating: { color: colors.star, fontSize: 16, fontWeight: "800", marginRight: 6 },
  tvBadge: {
    color: colors.brandSoft,
    backgroundColor: "rgba(124,92,255,0.18)",
    fontSize: 11,
    fontWeight: "800",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    overflow: "hidden",
    marginRight: 2,
  },
  rating: { color: colors.star, fontSize: 12, fontWeight: "700", marginRight: 6 },
  year: { color: colors.soft, fontSize: 15, fontWeight: "500" },
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
