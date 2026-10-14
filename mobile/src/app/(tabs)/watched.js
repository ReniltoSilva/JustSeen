import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useLibrary } from "../../library/LibraryContext";
import { getUserReviews } from "../../data/reviews";
import WatchedTile from "../../components/WatchedTile";
import { colors } from "../../lib/theme";

/* Everything I've reviewed, newest first, two to a row */
export default function Watched() {
  const { user } = useAuth();
  /* Goes up when I save or delete a review, so the list reloads */
  const { version } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setReviews(await getUserReviews(user.id));
      setError(false);
    } catch (err) {
      console.error("Failed to load watched movies:", err);
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

  return (
    <FlatList
      data={reviews ?? []}
      keyExtractor={(review) => review.id}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListHeaderComponent={
        error ? (
          <Text style={styles.error}>Couldn't load your movies. Pull down to try again.</Text>
        ) : reviews.length > 0 ? (
          <Text style={styles.subtitle}>
            {reviews.length} {reviews.length === 1 ? "movie" : "movies"} watched
          </Text>
        ) : null
      }
      renderItem={({ item }) => <WatchedTile review={item} />}
      ListEmptyComponent={
        error ? null : (
          <View style={styles.empty}>
            <Ionicons name="film-outline" size={40} color={colors.lineStrong} />
            <Text style={styles.emptyTitle}>Nothing watched yet</Text>
            <Text style={styles.emptyText}>Find a movie in Search and tell your friends what you thought.</Text>
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
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 14 },
  error: { color: colors.disagree, fontSize: 14, marginBottom: 14 },
  empty: { alignItems: "center", gap: 8, paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: { color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 4 },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
});
