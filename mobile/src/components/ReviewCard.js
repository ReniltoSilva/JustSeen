import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Avatar, { AvatarRing } from "./Avatar";
import { colors } from "../lib/theme";
import { posterUrl } from "../lib/tmdb";
import { genreName } from "../../../shared/genres";
import { relativeDay, releaseYear } from "../../../shared/dates";

const reactionKinds = [
  { kind: "agree", icon: "thumbs-up-outline", color: colors.agree },
  { kind: "unsure", icon: "remove-circle-outline", color: colors.unsure },
  { kind: "disagree", icon: "thumbs-down-outline", color: colors.disagree },
];

/* One review in the feed, laid out like the website's MovieCard */
const ReviewCard = ({ review, isMine }) => {
  const genres = (review.genre_ids ?? []).filter((id) => genreName(id)).slice(0, 3);
  const reactors = (review.reactions ?? []).filter((reaction) => reaction.profile).slice(0, 3);
  const count = (kind) => (review.reactions ?? []).filter((reaction) => reaction.kind === kind).length;

  return (
    <View style={styles.card}>
      {/* Who watched it and when */}
      <View style={styles.header}>
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
      </View>

      {/* Poster, fading into the card at the bottom */}
      <View style={styles.poster}>
        <Image source={posterUrl(review.poster_path)} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <LinearGradient colors={["transparent", colors.panel]} style={styles.posterFade} />
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>
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

        {/* Reactions (tapping them comes in the next step) */}
        <View style={styles.reactions}>
          <View style={styles.reactionCounts}>
            {reactionKinds.map(({ kind, icon, color }) => (
              <View key={kind} style={styles.reaction}>
                <Ionicons name={icon} size={15} color={color} />
                <Text style={[styles.reactionCount, { color }]}>{count(kind)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.reactors}>
            {reactors.map((reaction, i) => (
              <View key={reaction.user_id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                <AvatarRing color={colors.panel}>
                  <Avatar user={reaction.profile} size={20} />
                </AvatarRing>
              </View>
            ))}
          </View>
        </View>
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
  reactions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  reactionCounts: { flexDirection: "row", gap: 14 },
  reaction: { flexDirection: "row", alignItems: "center", gap: 5 },
  reactionCount: { fontSize: 12, fontWeight: "600" },
  reactors: { flexDirection: "row" },
});

export default ReviewCard;
