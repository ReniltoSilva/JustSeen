import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useLibrary } from "../../library/LibraryContext";
import { searchProfiles } from "../../data/people";
import PersonRow from "../../components/PersonRow";
import SuggestedPeople from "../../components/SuggestedPeople";
import { searchTitles, posterUrl } from "../../lib/tmdb";
import { openReview, openTitle } from "../../lib/navigation";
import { useSuggestions } from "../../lib/useSuggestions";
import { colors } from "../../lib/theme";
import { releaseYear } from "../../../../shared/dates";
import { isShow, titleKey } from "../../../../shared/titles";
import { suggestionNote } from "../../../../shared/suggestions";

/* Find a movie or TV show to open or review, or find people to follow. Before typing,
it suggests people you may know */
export default function Search() {
  const { user } = useAuth();
  const { myReviewFor } = useLibrary();
  const [mode, setMode] = useState("titles"); // "titles" (movies and shows) | "people"
  const [query, setQuery] = useState("");
  /* Results remember which mode they came from: titles and people look different */
  const [results, setResults] = useState({ mode: "titles", items: [] });
  const suggestions = useSuggestions();
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const minLength = mode === "titles" ? 2 : 1;

  /* Search once typing pauses, instead of on every letter. The old results stay on
  screen until the new ones arrive */
  useEffect(() => {
    const text = query.trim();
    if (text.length < minLength) {
      setResults({ mode, items: [] });
      setError("");
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      const search = mode === "titles" ? searchTitles(text) : searchProfiles(text, { excludeId: user.id });
      search
        .then((found) => {
          if (cancelled) return;
          setResults({ mode, items: found });
          setError("");
        })
        .catch((err) => {
          console.error("Search failed:", err);
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
  }, [query, mode, minLength, user.id]);

  const go = (open) => {
    Keyboard.dismiss();
    open();
  };

  const searched = query.trim().length >= minLength;
  const showSuggestions = mode === "people" && !searched;
  const items = results.mode === mode ? results.items : [];

  return (
    <View style={styles.screen}>
      <View style={styles.switcher}>
        {[
          { key: "titles", label: "Movies & TV", icon: "film-outline" },
          { key: "people", label: "People", icon: "people-outline" },
        ].map((option) => (
          <Pressable key={option.key} onPress={() => setMode(option.key)} style={[styles.option, mode === option.key && styles.optionActive]}>
            <Ionicons name={option.icon} size={15} color={mode === option.key ? colors.fg : colors.muted} />
            <Text style={[styles.optionText, mode === option.key && { color: colors.fg }]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={mode === "titles" ? "Search movies and TV shows" : "Search by name or username"}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize={mode === "people" ? "none" : "sentences"}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searching && <ActivityIndicator size="small" color={colors.brand} />}
      </View>

      <FlatList
        data={showSuggestions ? (suggestions ?? []) : items}
        keyExtractor={(item) => (item.movie_id ? titleKey(item) : (item.id ?? item.profile.id))}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          showSuggestions && suggestions?.length > 0 ? (
            <Text style={styles.heading}>People you may know</Text>
          ) : mode === "titles" && !searched ? (
            <SuggestedPeople suggestions={suggestions} />
          ) : null
        }
        renderItem={({ item }) =>
          showSuggestions ? (
            <PersonRow
              person={item.profile}
              note={suggestionNote(item)}
            />
          ) : mode === "people" ? (
            <PersonRow person={item} />
          ) : (
            <MovieRow
              movie={item}
              myReview={myReviewFor(item)}
              onOpen={() => go(() => openTitle(item))}
              onReview={() => go(() => openReview(item))}
            />
          )
        }
        ListEmptyComponent={
          error ? (
            <Text style={styles.message}>{error}</Text>
          ) : !searched ? (
            <View style={styles.hint}>
              <Ionicons name={mode === "titles" ? "film-outline" : "people-outline"} size={40} color={colors.lineStrong} />
              <Text style={styles.message}>
                {mode === "titles"
                  ? "Search for a movie or show you just watched and tell your friends what you thought."
                  : "Find your friends by their name or username, and follow them to see their reviews in your feed."}
              </Text>
            </View>
          ) : searching ? null : (
            <Text style={styles.message}>
              {mode === "titles" ? `Nothing found for “${query.trim()}”.` : `Nobody found for “${query.trim()}”.`}
            </Text>
          )
        }
      />
    </View>
  );
}

/* Bookmark button: adds the movie to my watchlist, or takes it off */
const SaveButton = ({ movie }) => {
  const { isSaved, toggleWatchlist } = useLibrary();
  const [busy, setBusy] = useState(false);
  const saved = isSaved(movie);

  const toggle = async () => {
    setBusy(true);
    try {
      await toggleWatchlist(movie);
    } catch (err) {
      console.error("Failed to update watchlist:", err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={busy}
      hitSlop={8}
      accessibilityLabel={saved ? `Remove ${movie.title} from your watchlist` : `Add ${movie.title} to your watchlist`}
      style={[styles.saveButton, saved && styles.saveButtonOn]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={colors.fg} />
      ) : (
        <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={16} color={saved ? colors.fg : colors.soft} />
      )}
    </Pressable>
  );
};

/* One search result: poster, title, "TV show" and year, and whether I've reviewed it.
Tap the row for the movie page, the buttons to save it or review it straight away */
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
      <Text style={styles.year}>
        {isShow(movie) && <Text style={styles.tv}>TV show{movie.release_date ? " · " : ""}</Text>}
        {releaseYear(movie.release_date)}
      </Text>
    </View>
    {myReview ? (
      <Pressable onPress={onReview} hitSlop={8} style={styles.reviewed} accessibilityLabel="Edit your review">
        <Ionicons name="star" size={12} color={colors.star} />
        <Text style={styles.reviewedText}>{Number(myReview.rating)}</Text>
      </Pressable>
    ) : (
      <>
        <SaveButton movie={movie} />
        <Pressable onPress={onReview} hitSlop={8} style={styles.reviewButton}>
          <Ionicons name="add" size={16} color={colors.brandSoft} />
          <Text style={styles.reviewButtonText}>Review</Text>
        </Pressable>
      </>
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1 },
  switcher: { flexDirection: "row", marginHorizontal: 16, marginTop: 12, padding: 4, borderRadius: 999, backgroundColor: colors.panel2 },
  option: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 999 },
  optionActive: { backgroundColor: colors.panel },
  optionText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  heading: { color: colors.muted, fontSize: 13, fontWeight: "700", paddingHorizontal: 10, paddingTop: 8, paddingBottom: 4 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    margin: 16,
    marginTop: 12,
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
  tv: { color: colors.brandSoft, fontWeight: "600" },
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
  saveButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  saveButtonOn: { backgroundColor: colors.panel2, borderColor: colors.panel2 },
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
