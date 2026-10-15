import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../auth/AuthContext";
import { useLibrary } from "../../library/LibraryContext";
import { getFeed } from "../../data/reviews";
import { getFollowingIds } from "../../data/people";
import ReviewCard from "../../components/ReviewCard";
import FeedHeader, { FeedDesignPicker, feedDesigns } from "../../components/FeedHeader";
import { colors } from "../../lib/theme";

/* PREVIEW: the feed design picked last, kept while the app runs */
let pickedDesign = "card";

/* Reviews by me and the people I follow, newest first. Pull down to refresh */
export default function Feed() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [design, setDesign] = useState(pickedDesign);
  const ownTopBar = feedDesigns.find((option) => option.key === design)?.ownTopBar;
  const { user } = useAuth();
  /* Goes up when I save or delete a review or follow someone, so the feed reloads */
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

  /* Some designs bring their own top (with the bell); "Friends row" shows the app name */
  useLayoutEffect(() => {
    pickedDesign = design;
    navigation.setOptions({
      headerShown: !ownTopBar,
      headerTitle: design === "friends" ? () => <Text style={styles.brand}>JustSeen</Text> : "Feed",
    });
  }, [navigation, design, ownTopBar]);

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
      renderItem={({ item }) => <ReviewCard review={item} />}
      contentContainerStyle={[styles.list, ownTopBar && { paddingTop: insets.top + 12 }]}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      ListHeaderComponent={
        <View>
          <FeedDesignPicker design={design} onChange={setDesign} />
          <FeedHeader design={design} />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      }
      ListEmptyComponent={
        error ? null : (
          <Text style={styles.empty}>Nothing here yet. Review a movie or show, or follow a few people to fill your feed.</Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16, paddingBottom: 32, maxWidth: 480, width: "100%", alignSelf: "center" },
  brand: { color: colors.fg, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
  error: { color: colors.disagree, fontSize: 14, marginBottom: 12 },
  empty: { color: colors.muted, fontSize: 15, textAlign: "center", paddingVertical: 48, lineHeight: 22 },
});
