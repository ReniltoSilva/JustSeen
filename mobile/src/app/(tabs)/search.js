import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../../library/LibraryContext";
import { searchMovies, posterUrl } from "../../lib/tmdb";
import { openMovie, openReview } from "../../lib/navigation";
import { colors } from "../../lib/theme";
import { releaseYear } from "../../../../shared/dates";

/* Find a movie and tap it to review it (or edit the review if I already wrote one) */
export default function Search() {
  const { myReviewFor } = useLibrary();
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  /* Search once typing pauses, instead of on every letter */
  useEffect(() => {
    const text = query.trim();
    if (text.length < 2) {
      setMovies([]);
      setError("");
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchMovies(text)
        .then((results) => {
          if (cancelled) return;
          setMovies(results);
          setError("");
        })
        .catch((err) => {
          console.error("Movie search failed:", err);
          if (!cancelled) setError("Search isn't working right now. Check your connection and try again.");
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const go = (open) => {
    Keyboard.dismiss();
    open();
  };

  const searched = query.trim().length >= 2;

  return (
    <View style={styles.screen}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a movie"
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searching && <ActivityIndicator size="small" color={colors.brand} />}
      </View>

      <FlatList
        data={movies}
        keyExtractor={(movie) => String(movie.movie_id)}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <MovieRow
            movie={item}
            myReview={myReviewFor(item.movie_id)}
            onOpen={() => go(() => openMovie(item.movie_id))}
            onReview={() => go(() => openReview(item))}
          />
        )}
        ListEmptyComponent={
          error ? (
            <Text style={styles.message}>{error}</Text>
          ) : !searched ? (
            <View style={styles.hint}>
              <Ionicons name="film-outline" size={40} color={colors.lineStrong} />
              <Text style={styles.message}>Search for something you just watched and tell your friends what you thought.</Text>
            </View>
          ) : searching ? null : (
            <Text style={styles.message}>No movies found for “{query.trim()}”.</Text>
          )
        }
      />
    </View>
  );
}

/* One search result: poster, title and year, and whether I've reviewed it.
Tap the row for the movie page, the button to review it straight away */
const MovieRow = ({ movie, myReview, onOpen, onReview }) => (
  <Pressable onPress={onOpen} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.panel2 }]}>
    <View style={styles.thumb}>
      {movie.poster_path ? (
        <Image source={posterUrl(movie.poster_path, "w154")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
      ) : (
        <Ionicons name="film-outline" size={22} color={colors.muted} />
      )}
    </View>
    <View style={styles.rowText}>
      <Text style={styles.title} numberOfLines={2}>
        {movie.title}
      </Text>
      {movie.release_date ? <Text style={styles.year}>{releaseYear(movie.release_date)}</Text> : null}
    </View>
    {myReview ? (
      <Pressable onPress={onReview} hitSlop={8} style={styles.reviewed} accessibilityLabel="Edit your review">
        <Ionicons name="star" size={12} color={colors.star} />
        <Text style={styles.reviewedText}>{Number(myReview.rating)}</Text>
      </Pressable>
    ) : (
      <Pressable onPress={onReview} hitSlop={8} style={styles.reviewButton}>
        <Ionicons name="add" size={16} color={colors.brandSoft} />
        <Text style={styles.reviewButtonText}>Review</Text>
      </Pressable>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.line,
  },
  input: { flex: 1, color: colors.fg, fontSize: 16, height: "100%" },
  list: { paddingHorizontal: 8, paddingBottom: 32 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 8, borderRadius: 12 },
  thumb: {
    width: 48,
    aspectRatio: 2 / 3,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  rowText: { flex: 1, gap: 2 },
  title: { color: colors.fg, fontSize: 15, fontWeight: "600", lineHeight: 20 },
  year: { color: colors.muted, fontSize: 13 },
  reviewed: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(245,158,11,0.12)",
  },
  reviewedText: { color: colors.star, fontSize: 13, fontWeight: "700" },
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(124,92,255,0.15)",
  },
  reviewButtonText: { color: colors.brandSoft, fontSize: 13, fontWeight: "600" },
  hint: { alignItems: "center", gap: 12, paddingTop: 48 },
  message: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22, paddingHorizontal: 32, paddingTop: 16 },
});
