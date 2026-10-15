import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../library/LibraryContext";
import { getUserReviews } from "../data/reviews";
import { getFollowCounts } from "../data/people";
import { getWatchlist } from "../data/watchlist";
import { openFollows, openYear } from "../lib/navigation";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import WatchedTile from "./WatchedTile";
import WatchlistTile from "./WatchlistTile";
import { titleKey } from "../../../shared/titles";
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

/* Someone's profile: who they are, their stats, and what they've watched or want to
watch as a grid of posters */
const ProfileView = ({ person, isMe }) => {
  const { version, watchlist: myWatchlist } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [theirWatchlist, setTheirWatchlist] = useState(null);
  const [tab, setTab] = useState("watched");
  const [counts, setCounts] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, followCounts, saved] = await Promise.all([
        getUserReviews(person.id),
        getFollowCounts(person.id),
        isMe ? null : getWatchlist(person.id),
      ]);
      setReviews(list);
      setTheirWatchlist(saved);
      setCounts(followCounts);
      setError(false);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [person.id, isMe, version]);

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
  /* My own watchlist comes from the library, so changes show straight away */
  const watchlist = isMe ? myWatchlist : (theirWatchlist ?? []);
  const tabs = [
    { key: "watched", label: "Watched", count: reviews?.length },
    { key: "watchlist", label: "Watchlist", count: isMe || theirWatchlist ? watchlist.length : undefined },
  ];

  const stats = [
    { label: "WATCHED", value: reviews ? list.length : "·" },
    { label: "AVG RATING", value: avg ? `★ ${avg}` : "—" },
    { label: "FOLLOWERS", value: counts?.followers ?? "·", onPress: () => openFollows(person.username, "followers") },
    { label: "FOLLOWING", value: counts?.following ?? "·", onPress: () => openFollows(person.username, "following") },
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
        {/* My own "Edit profile" is in the avatar menu, top right */}
        {!isMe && <FollowButton person={person} />}
        {favorite && <Text style={styles.loves}>Loves {favorite}</Text>}
        <Pressable onPress={() => openYear(person.username)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
          <LinearGradient colors={[colors.brand, "#d946ef"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.yearChip}>
            <Ionicons name="sparkles" size={13} color="#fff" />
            <Text style={styles.yearChipText}>
              {isMe ? "Your" : `${firstName}'s`} {new Date().getFullYear()} in film
            </Text>
          </LinearGradient>
        </Pressable>
      </View>

      <View style={styles.stats}>
        {stats.map((stat) => (
          <Pressable
            key={stat.label}
            onPress={stat.onPress}
            disabled={!stat.onPress}
            style={({ pressed }) => [styles.stat, pressed && { backgroundColor: colors.panel2 }]}
          >
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Watched / Watchlist tabs */}
      <View style={styles.tabs}>
        {tabs.map(({ key, label, count }) => (
          <Pressable key={key} onPress={() => setTab(key)} style={[styles.tab, tab === key && styles.tabActive]}>
            <Text style={[styles.tabText, tab === key && { color: colors.fg }]}>
              {label}
              {count !== undefined && <Text style={styles.tabCount}>  {count}</Text>}
            </Text>
          </Pressable>
        ))}
      </View>
      {error && <Text style={styles.error}>Couldn't load the reviews. Pull down to try again.</Text>}
    </View>
  );

  return (
    <FlatList
      data={tab === "watched" ? list : watchlist}
      keyExtractor={(item) => `${tab}-${item.id ?? titleKey(item)}`}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      ListHeaderComponent={header}
      renderItem={({ item }) => (tab === "watched" ? <WatchedTile review={item} /> : <WatchlistTile entry={item} mine={isMe} />)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListEmptyComponent={
        reviews === null && !error ? (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
        ) : reviews ? (
          <Text style={styles.empty}>
            {tab === "watched"
              ? isMe
                ? "You haven't reviewed anything yet. Find a movie or show in Search."
                : `${firstName} hasn't reviewed anything yet.`
              : isMe
                ? "Your watchlist is empty."
                : `${firstName}'s watchlist is empty.`}
          </Text>
        ) : null
      }
    />
  );
};


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
  yearChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 },
  yearChipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
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
  tabs: { flexDirection: "row", gap: 24, borderBottomWidth: 1, borderBottomColor: colors.line, marginTop: 8 },
  tab: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: "transparent", marginBottom: -1 },
  tabActive: { borderBottomColor: colors.brand },
  tabText: { color: colors.muted, fontSize: 17, fontWeight: "700" },
  tabCount: { color: colors.muted, fontSize: 13, fontWeight: "500" },
  error: { color: colors.disagree, fontSize: 14 },
  empty: { color: colors.muted, fontSize: 15, textAlign: "center", paddingVertical: 32, lineHeight: 22 },
  columns: { gap: 12 },
});

export default ProfileView;
