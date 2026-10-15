import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import { useNotifications } from "../notifications/NotificationsContext";
import { openProfile, openTitle } from "../lib/navigation";
import { posterUrl } from "../lib/tmdb";
import { colors } from "../lib/theme";
import Avatar from "../components/Avatar";
import { timeAgo } from "../../../shared/dates";

const reactionText = {
  agree: { verb: "agreed with", color: colors.agree },
  unsure: { verb: "isn't sure about", color: colors.unsure },
  disagree: { verb: "disagreed with", color: colors.disagree },
};

/* Who followed me and who reacted to my reviews, newest first */
export default function Activity() {
  const { notifications, loaded, markRead, reload } = useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  /* Opening this tab counts as reading them; leaving keeps the "new" dots until then */
  useFocusEffect(
    useCallback(() => {
      return () => markRead();
    }, [markRead]),
  );

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  if (!loaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }

  return (
    <FlatList
      data={notifications}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
      renderItem={({ item }) => <NotificationRow item={item} />}
      ListEmptyComponent={
        <Text style={styles.empty}>Nothing yet. When people follow you or react to your reviews, you'll see it here.</Text>
      }
    />
  );
}

/* One notification. Tapping a follow opens their profile, a reaction opens the movie or show */
const NotificationRow = ({ item }) => {
  const isFollow = item.type === "follow";
  const reaction = reactionText[item.reaction] ?? reactionText.agree;
  const poster = posterUrl(item.review?.poster_path, "w92");

  const open = () => {
    if (isFollow) {
      if (item.actor) openProfile(item.actor.username);
    } else if (item.review) openTitle(item.review);
  };

  return (
    <Pressable onPress={open} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.panel2 }]}>
      {!item.read && <View style={styles.dot} />}
      <Avatar user={item.actor} size={40} />
      <View style={styles.text}>
        <Text style={styles.sentence}>
          <Text style={styles.name}>{item.actor?.name ?? "Someone"}</Text>{" "}
          {isFollow ? (
            "started following you"
          ) : (
            <>
              <Text style={{ color: reaction.color }}>{reaction.verb}</Text> your review of{" "}
              <Text style={styles.name}>{item.review?.title ?? "your review"}</Text>
            </>
          )}
        </Text>
        <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
      </View>
      {poster && <Image source={poster} style={styles.poster} contentFit="cover" />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 8, paddingBottom: 32 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, paddingLeft: 16, borderRadius: 14 },
  dot: { position: "absolute", left: 4, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brand },
  text: { flex: 1, gap: 3 },
  sentence: { color: colors.soft, fontSize: 14, lineHeight: 20 },
  name: { color: colors.fg, fontWeight: "600" },
  time: { color: colors.muted, fontSize: 12 },
  poster: { width: 34, aspectRatio: 2 / 3, borderRadius: 5 },
  empty: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22, padding: 40 },
});
