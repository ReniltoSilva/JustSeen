import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useLibrary } from "../../library/LibraryContext";
import { getUserReviews } from "../../data/reviews";
import WatchedTile from "../../components/WatchedTile";
import { colors } from "../../lib/theme";
import { isShow, mixLabel } from "../../../../shared/titles";

/* Everything I've reviewed, movies and shows, newest first, two to a row */
export default function Watched() {
  const { user } = useAuth();
  /* Goes up when I save or delete a review, so the list reloads */
  const { version } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [kind, setKind] = useState("all"); // "all" | "movie" | "tv"

  const load = useCallback(async () => {
    try {
      setReviews(await getUserReviews(user.id));
      setError(false);
    } catch (err) {
      console.error("Failed to load what I watched:", err);
      setError(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, version]);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (reviews === null && !error) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  const all = reviews ?? [];
  const shows = all.filter(isShow);
  const movies = all.filter((review) => !isShow(review));
  const shown = kind === "movie" ? movies : kind === "tv" ? shows : all;
  const filters = [
    { key: "all", label: "All", count: all.length },
    { key: "movie", label: "Movies", count: movies.length },
    { key: "tv", label: "TV shows", count: shows.length },
  ];

  return (
    <FlatList
      data={shown}
      keyExtractor={(review) => review.id}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListHeaderComponent={
        error ? (
          <Text style={styles.error}>Couldn't load what you watched. Pull down to try again.</Text>
        ) : all.length > 0 ? (
          <View style={styles.header}>
            <Text style={styles.subtitle}>{mixLabel(all)} watched</Text>
            {/* Only worth filtering once there's both */}
            {shows.length > 0 && movies.length > 0 && (
              <View style={styles.filters}>
                {filters.map((filter) => (
                  <Pressable
                    key={filter.key}
                    onPress={() => setKind(filter.key)}
                    style={[styles.filter, kind === filter.key && styles.filterActive]}
                  >
                    <Text style={[styles.filterText, kind === filter.key && { color: colors.fg }]}>
                      {filter.label} <Text style={styles.filterCount}>{filter.count}</Text>
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        ) : null
      }
      renderItem={({ item }) => <WatchedTile review={item} />}
      ListEmptyComponent={
        error ? null : (
          <View style={styles.empty}>
            <Ionicons name="film-outline" size={40} color={colors.lineStrong} />
            <Text style={styles.emptyTitle}>Nothing watched yet</Text>
            <Text style={styles.emptyText}>Find a movie or show in Search and tell your friends what you thought.</Text>
          </View>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40 },
  columns: { gap: 12 },
  header: { gap: 10, marginBottom: 14 },
  subtitle: { color: colors.muted, fontSize: 14 },
  filters: { flexDirection: "row", gap: 8 },
  filter: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong },
  filterActive: { backgroundColor: colors.panel2, borderColor: colors.brand },
  filterText: { color: colors.soft, fontSize: 13, fontWeight: "600" },
  filterCount: { color: colors.muted, fontWeight: "500" },
  error: { color: colors.disagree, fontSize: 14, marginBottom: 14 },
  empty: { alignItems: "center", gap: 8, paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: { color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 4 },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
});
