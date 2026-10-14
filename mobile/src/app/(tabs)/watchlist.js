import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../../library/LibraryContext";
import { openMovie, openReview } from "../../lib/navigation";
import { posterUrl } from "../../lib/tmdb";
import { colors } from "../../lib/theme";
import { releaseYear } from "../../../../shared/dates";

/* Movies I want to watch. Reviewing one takes it off the list */
export default function Watchlist() {
  const { watchlist } = useLibrary();

  return (
    <FlatList
      data={watchlist}
      keyExtractor={(movie) => String(movie.movie_id)}
      numColumns={2}
      columnWrapperStyle={styles.columns}
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        watchlist.length > 0 ? <Text style={styles.subtitle}>Watched one? Tap "I watched it" to review it.</Text> : null
      }
      renderItem={({ item }) => <WatchlistTile movie={item} />}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="bookmark-outline" size={40} color={colors.lineStrong} />
          <Text style={styles.emptyTitle}>Your watchlist is empty</Text>
          <Text style={styles.emptyText}>Open any movie and tap "Add to watchlist" to save it for later.</Text>
        </View>
      }
    />
  );
}

const WatchlistTile = ({ movie }) => (
  <View style={styles.tile}>
    <Pressable onPress={() => openMovie(movie.movie_id)} style={({ pressed }) => [styles.poster, pressed && { opacity: 0.8 }]}>
      <Image source={posterUrl(movie.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
    </Pressable>
    <Text style={styles.title} numberOfLines={1}>
      {movie.title}
    </Text>
    {movie.release_date ? <Text style={styles.year}>{releaseYear(movie.release_date)}</Text> : null}
    <Pressable onPress={() => openReview(movie)} style={({ pressed }) => [styles.watched, pressed && { opacity: 0.8 }]}>
      <Ionicons name="checkmark" size={15} color={colors.brandSoft} />
      <Text style={styles.watchedText}>I watched it</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  subtitle: { color: colors.muted, fontSize: 14, marginBottom: 14 },
  columns: { gap: 12 },
  tile: { flex: 1, maxWidth: "50%", marginBottom: 20, gap: 3 },
  poster: { aspectRatio: 2 / 3, borderRadius: 12, overflow: "hidden", backgroundColor: colors.panel2, marginBottom: 4 },
  title: { color: colors.fg, fontSize: 14, fontWeight: "600" },
  year: { color: colors.muted, fontSize: 12 },
  watched: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 6,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(124,92,255,0.15)",
  },
  watchedText: { color: colors.brandSoft, fontSize: 13, fontWeight: "600" },
  empty: { alignItems: "center", gap: 8, paddingTop: 64, paddingHorizontal: 32 },
  emptyTitle: { color: colors.fg, fontSize: 18, fontWeight: "700", marginTop: 4 },
  emptyText: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
});
