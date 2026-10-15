import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../../library/LibraryContext";
import WatchlistTile from "../../components/WatchlistTile";
import { colors } from "../../lib/theme";
import { mixLabel, titleKey } from "../../../../shared/titles";

/* Movies and shows I want to watch. Reviewing one takes it off the list */
export default function Watchlist() {
  const { watchlist } = useLibrary();

  return (
    <FlatList
      data={watchlist}
      keyExtractor={titleKey}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      ListHeaderComponent={watchlist.length > 0 ? <Text style={styles.subtitle}>{mixLabel(watchlist)} to watch</Text> : null}
      renderItem={({ item }) => <WatchlistTile entry={item} mine />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={40} color={colors.lineStrong} />
          <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
          <Text style={styles.emptyText}>Tap the bookmark next to a movie or show in Search, or "Add to watchlist" on its page.</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 14 },
  columns: { gap: 12 },
  empty: { alignItems: "center", gap: 8, paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: { color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 4 },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
});
