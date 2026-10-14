import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { openReview } from "../../lib/openReview";
import { useAuth } from "../../auth/AuthContext";
import { useLibrary } from "../../library/LibraryContext";
import { getFeed, getFollowingIds } from "../../data/feed";
import ReviewCard from "../../components/ReviewCard";
import { colors } from "../../lib/theme";

/* Reviews by me and the people I follow, newest first. Pull down to refresh */
export default function Feed() {
  const { user } = useAuth();
  /* Goes up when I save or delete a review, so the feed reloads */
  const { version } = useLibrary();
  const [reviews, setReviews] = useState(null);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const following = await getFollowingIds(user.id);
      setReviews(await getFeed([user.id, ...following]));
      setError("");
    } catch (err) {
      console.error("Failed to load feed:", err);
      setError("Could not load your feed. Pull down to try again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, version]);

  useEffect(() => {
    load();
  }, [load]);

  /* Tapping one of my own reviews opens it for editing */
  const editReview = (review) => {
    const { movie_id, title, poster_path, overview, genre_ids, release_date, runtime } = review;
    openReview({ movie_id, title, poster_path, overview, genre_ids, release_date, runtime });
  };

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
      renderItem={({ item }) =>
        item.user_id === user.id ? (
          <Pressable onPress={() => editReview(item)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
            <ReviewCard review={item} isMine />
          </Pressable>
        ) : (
          <ReviewCard review={item} />
        )
      }
      contentContainerStyle={styles.list}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListHeaderComponent={
        <View style={styles.heading}>
          <Text style={styles.title}>Latest activity</Text>
          <Text style={styles.subtitle}>What you and the people you follow watched lately.</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        error ? null : (
          <Text style={styles.empty}>Nothing here yet. Review a movie or follow a few people to fill your feed.</Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 32, maxWidth: 480, width: "100%", alignSelf: "center" },
  heading: { marginBottom: 16, gap: 4 },
  title: { color: colors.fg, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.muted, fontSize: 14 },
  error: { color: colors.disagree, fontSize: 14, marginTop: 8 },
  empty: { color: colors.muted, fontSize: 15, textAlign: "center", paddingVertical: 48, lineHeight: 22 },
});
