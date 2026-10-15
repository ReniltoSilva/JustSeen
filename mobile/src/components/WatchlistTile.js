import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useLibrary } from "../library/LibraryContext";
import { openReview, openTitle } from "../lib/navigation";
import { posterUrl } from "../lib/tmdb";
import { colors } from "../lib/theme";
import { releaseYear } from "../../../shared/dates";
import { isShow, titleOf } from "../../../shared/titles";
import { BookmarkIcon, PencilIcon, StarPlusIcon } from "./icons";

/* A movie or show on a watchlist, in a two-column grid. Tap the poster for its page.
- mine: the cross takes it off my list; "Watched it? Review" reviews it (which also
  takes it off)
- someone else's: the corner button reviews it; the button underneath saves it to my
  own watchlist (or shows my rating, if I've already watched it) */
const WatchlistTile = ({ entry, mine = false }) => {
  const { myReviewFor, isSaved, toggleWatchlist } = useLibrary();
  const [busy, setBusy] = useState(false);
  const movie = titleOf(entry);
  const myReview = myReviewFor(movie);
  const saved = isSaved(movie);

  const toggle = async () => {
    setBusy(true);
    try {
      await toggleWatchlist(movie);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.tile}>
      <Pressable onPress={() => openTitle(movie)} style={({ pressed }) => [styles.poster, pressed && { opacity: 0.8 }]}>
        <Image source={posterUrl(movie.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" transition={150} />
        {mine ? (
          <Pressable
            onPress={toggle}
            disabled={busy}
            hitSlop={6}
            accessibilityLabel={`Remove ${movie.title} from your watchlist`}
            style={({ pressed }) => [styles.corner, pressed && { opacity: 0.7 }]}
          >
            {busy ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="close" size={16} color="#fff" />}
          </Pressable>
        ) : (
          <Pressable
            onPress={() => openReview(movie)}
            hitSlop={6}
            accessibilityLabel={myReview ? "Edit your review" : `Review ${movie.title}`}
            style={({ pressed }) => [styles.corner, pressed && { opacity: 0.7 }]}
          >
            {myReview ? <PencilIcon size={15} color="#fbbf24" /> : <StarPlusIcon size={15} />}
          </Pressable>
        )}
      </Pressable>

      <Text style={styles.title} numberOfLines={1}>
        {movie.title}
      </Text>
      <Text style={styles.year}>{[isShow(movie) && "TV show", releaseYear(movie.release_date)].filter(Boolean).join(" · ") || " "}</Text>

      {mine ? (
        <Pressable onPress={() => openReview(movie)} style={({ pressed }) => [styles.button, styles.review, pressed && { opacity: 0.8 }]}>
          <Ionicons name="star-outline" size={14} color={colors.brandSoft} />
          <Text style={styles.reviewText}>Watched it? Review</Text>
        </Pressable>
      ) : myReview ? (
        <Pressable onPress={() => openReview(movie)} style={({ pressed }) => [styles.button, styles.rated, pressed && { opacity: 0.8 }]}>
          <Ionicons name="star" size={13} color={colors.star} />
          <Text style={styles.ratedText}>You gave it {Number(myReview.rating)}</Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={toggle}
          disabled={busy}
          accessibilityLabel={saved ? `Remove ${movie.title} from your watchlist` : `Add ${movie.title} to your watchlist`}
          style={({ pressed }) => [styles.button, saved ? styles.saved : styles.save, (pressed || busy) && { opacity: 0.8 }]}
        >
          <BookmarkIcon size={14} filled={saved} color={saved ? colors.fg : "#fff"} />
          <Text style={styles.saveText}>{saved ? "On your watchlist" : "Save to watchlist"}</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tile: { flex: 1, maxWidth: "50%", marginBottom: 20, gap: 3 },
  poster: { aspectRatio: 2 / 3, borderRadius: 12, overflow: "hidden", backgroundColor: colors.panel2, marginBottom: 4 },
  corner: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(9,9,13,0.6)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  title: { color: colors.fg, fontSize: 14, fontWeight: "600" },
  year: { color: colors.muted, fontSize: 12 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 6,
    paddingVertical: 7,
    borderRadius: 999,
  },
  review: { backgroundColor: "rgba(124,92,255,0.15)" },
  reviewText: { color: colors.brandSoft, fontSize: 13, fontWeight: "600" },
  rated: { backgroundColor: "rgba(245,158,11,0.12)" },
  ratedText: { color: colors.star, fontSize: 13, fontWeight: "700" },
  save: { backgroundColor: colors.brand },
  saved: { backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.lineStrong },
  saveText: { color: colors.fg, fontSize: 13, fontWeight: "600" },
});

export default WatchlistTile;
