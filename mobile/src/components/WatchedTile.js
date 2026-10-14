import { Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { openMovie } from "../lib/navigation";
import { posterUrl } from "../lib/tmdb";
import { colors } from "../lib/theme";
import { useToday } from "../lib/useToday";
import Avatar, { AvatarRing } from "./Avatar";
import PosterActions from "./PosterActions";
import { relativeDay, releaseYear } from "../../../shared/dates";

const reactionKinds = [
  { kind: "agree", icon: "thumbs-up", color: colors.agree },
  { kind: "unsure", icon: "remove-circle", color: colors.unsure },
  { kind: "disagree", icon: "thumbs-down", color: colors.disagree },
];

/* One watched movie in a two-column grid: the poster with the rating, the website's
quick actions and the faces of who reacted, then the title, year, when, the review
and its reaction counts */
const WatchedTile = ({ review }) => {
  const today = useToday();
  const reactions = review.reactions ?? [];
  const reactors = reactions.filter((reaction) => reaction.profile);
  const count = (kind) => reactions.filter((reaction) => reaction.kind === kind).length;

  return (
    <View style={styles.tile}>
      <Pressable onPress={() => openMovie(review.movie_id)} style={({ pressed }) => [styles.poster, pressed && { opacity: 0.85 }]}>
        <Image source={posterUrl(review.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        <View style={styles.rating}>
          <Ionicons name="star" size={11} color={colors.star} />
          <Text style={styles.ratingText}>{Number(review.rating)}</Text>
        </View>
        <PosterActions review={review} />
        {reactors.length > 0 && (
          <>
            <LinearGradient colors={["transparent", "rgba(9,9,13,0.8)"]} style={styles.facesFade} />
            <View style={styles.faces} accessibilityLabel={`${reactors.length} ${reactors.length === 1 ? "person" : "people"} reacted`}>
              {reactors.slice(0, 4).map((reaction, i) => (
                <View key={reaction.user_id} style={{ marginLeft: i === 0 ? 0 : -7 }}>
                  <AvatarRing color="rgba(9,9,13,0.9)">
                    <Avatar user={reaction.profile} size={20} />
                  </AvatarRing>
                </View>
              ))}
              {reactors.length > 4 && <Text style={styles.more}>+{reactors.length - 4}</Text>}
            </View>
          </>
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
  facesFade: { position: "absolute", left: 0, right: 0, bottom: 0, height: 48 },
  faces: { position: "absolute", left: 8, bottom: 8, flexDirection: "row", alignItems: "center" },
  more: { color: colors.fg, fontSize: 11, fontWeight: "700", marginLeft: 5 },
  title: { color: colors.fg, fontSize: 14, fontWeight: "700", lineHeight: 18 },
  meta: { color: colors.muted, fontSize: 11 },
  review: { color: colors.soft, fontSize: 12, lineHeight: 17, marginTop: 3 },
  reactions: { flexDirection: "row", gap: 10, marginTop: 5 },
  reaction: { flexDirection: "row", alignItems: "center", gap: 3 },
  reactionCount: { fontSize: 11, fontWeight: "600" },
});

export default WatchedTile;
