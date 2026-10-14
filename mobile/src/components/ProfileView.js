import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../library/LibraryContext";
import { getUserReviews } from "../data/reviews";
import { getFollowCounts } from "../data/people";
import { openMovie } from "../lib/navigation";
import { posterUrl } from "../lib/tmdb";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import { genreName } from "../../../shared/genres";

/* Genre that shows up most across the reviews */
const favoriteGenre = (reviews) => {
  const counts = new Map();
  for (const review of reviews) {
    for (const id of review.genre_ids ?? []) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return top ? genreName(top[0]) : null;
};

const averageRating = (reviews) => {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
  return (total / reviews.length).toFixed(1);
};

/* Someone's profile: who they are, their stats, and everything they've watched as a
grid of posters. `footer` goes under the grid (my Profile tab puts Log out there) */
const ProfileView = ({ person, isMe, footer }) => {
  const { version } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, followCounts] = await Promise.all([getUserReviews(person.id), getFollowCounts(person.id)]);
      setReviews(list);
      setCounts(followCounts);
      setError(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.id, version]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const list = reviews ?? [];
  const avg = averageRating(list);
  const favorite = favoriteGenre(list);
  const firstName = person.name.split(" ")[0];

  const stats = [
    { label: "WATCHED", value: reviews ? list.length : "·" },
    { label: "AVG RATING", value: avg ? `★ ${avg}` : "—" },
    { label: "FOLLOWERS", value: counts?.followers ?? "·" },
    { label: "FOLLOWING", value: counts?.following ?? "·" },
  ];

  const header = (
    <View style={styles.header}>
      <View style={styles.identity}>
        <View style={styles.avatarRing}>
          <Avatar user={person} size={80} />
        </View>
        <View style={styles.names}>
          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.muted}>@{person.username}</Text>
          {person.location ? (
            <View style={styles.location}>
              <Ionicons name="location-outline" size={13} color={colors.muted} />
              <Text style={styles.muted}>{person.location}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {person.bio ? <Text style={styles.bio}>{person.bio}</Text> : null}

      <View style={styles.badges}>
        {!isMe && <FollowButton person={person} />}
        {favorite && <Text style={styles.loves}>Loves {favorite}</Text>}
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>{isMe ? "What you watched" : `What ${firstName} watched`}</Text>
      {error && <Text style={styles.error}>Couldn't load the reviews. Pull down to try again.</Text>}
    </View>
  );

  return (
    <FlatList
      data={list}
      keyExtractor={(review) => review.id}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      renderItem={({ item }) => <PosterTile review={item} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListEmptyComponent={
        reviews === null && !error ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
        ) : reviews ? (
          <Text style={styles.empty}>
            {isMe ? "You haven't reviewed anything yet. Find a movie in Search." : `${firstName} hasn't reviewed anything yet.`}
          </Text>
        ) : null
      }
      ListFooterComponent={footer}
    />
  );
};

/* One watched movie: poster with the rating on it, the title and the review */
const PosterTile = ({ review }) => (
  <Pressable onPress={() => openMovie(review.movie_id)} style={({ pressed }) => [styles.tile, pressed && { opacity: 0.8 }]}>
    <View style={styles.tilePoster}>
      <Image source={posterUrl(review.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      <View style={styles.tileRating}>
        <Ionicons name="star" size={11} color={colors.star} />
        <Text style={styles.tileRatingText}>{Number(review.rating)}</Text>
      </View>
    </View>
    <Text style={styles.tileTitle} numberOfLines={1}>
      {review.title}
    </Text>
    {review.review ? (
      <Text style={styles.tileReview} numberOfLines={2}>
        {review.review}
      </Text>
    ) : null}
  </Pressable>
);

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  header: { gap: 14, marginBottom: 16 },
  identity: { flexDirection: "row", alignItems: "center", gap: 16 },
  avatarRing: { borderRadius: 999, borderWidth: 2, borderColor: colors.brand, padding: 3 },
  names: { flex: 1, gap: 2 },
  name: { color: colors.fg, fontSize: 22, fontWeight: "800" },
  muted: { color: colors.muted, fontSize: 14 },
  location: { flexDirection: "row", alignItems: "center", gap: 3 },
  bio: { color: colors.soft, fontSize: 15, lineHeight: 21 },
  badges: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10 },
  loves: {
    color: colors.brandSoft,
    backgroundColor: "rgba(124,92,255,0.15)",
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: "hidden",
  },
  stats: { flexDirection: "row", gap: 8 },
  stat: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  statValue: { color: colors.fg, fontSize: 17, fontWeight: "800" },
  statLabel: { color: colors.muted, fontSize: 9, fontWeight: "600", letterSpacing: 0.6 },
  section: { color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 8 },
  error: { color: colors.disagree, fontSize: 14 },
  empty: { color: colors.muted, fontSize: 15, textAlign: "center", paddingVertical: 32, lineHeight: 22 },
  columns: { gap: 12 },
  tile: { flex: 1, maxWidth: "50%", marginBottom: 18, gap: 4 },
  tilePoster: { aspectRatio: 2 / 3, borderRadius: 12, overflow: "hidden", backgroundColor: colors.panel2 },
  tileRating: {
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
  tileRatingText: { color: colors.fg, fontSize: 12, fontWeight: "700" },
  tileTitle: { color: colors.fg, fontSize: 14, fontWeight: "600", marginTop: 4 },
  tileReview: { color: colors.soft, fontSize: 12, lineHeight: 17 },
});

export default ProfileView;
