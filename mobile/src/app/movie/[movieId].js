import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useLibrary } from "../../library/LibraryContext";
import { getMovieReviews } from "../../data/reviews";
import { getMovieDetails, posterUrl, toMovie } from "../../lib/tmdb";
import { openReview } from "../../lib/navigation";
import { colors } from "../../lib/theme";
import ReviewCard from "../../components/ReviewCard";
import { releaseYear } from "../../../../shared/dates";

const formatRuntime = (minutes) => (minutes ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : null);

const average = (reviews) =>
  reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating), 0) / reviews.length).toFixed(1) : null;

/* One movie: details from TMDB, plus everything JustSeen people said about it,
people I follow first. Opened by tapping a poster or a search result */
export default function MovieScreen() {
  const { movieId } = useLocalSearchParams();
  const id = Number(movieId);
  const { user } = useAuth();
  const { myReviewFor, isSaved, toggleWatchlist, followingIds, version } = useLibrary();

  const [details, setDetails] = useState(null);
  const [failed, setFailed] = useState(false);
  const [reviews, setReviews] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMovieDetails(id, { append_to_response: "credits" })
      .then((data) => !cancelled && setDetails(data))
      .catch((error) => {
        console.error("Failed to load movie:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const loadReviews = useCallback(
    () =>
      getMovieReviews(id)
        .then(setReviews)
        .catch((error) => console.error("Failed to load reviews:", error)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id, version],
  );

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const refresh = async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  };

  if (!details) {
    return (
      <View style={styles.center}>
        {failed ? (
          <Text style={styles.muted}>Couldn't load this movie. Check your connection.</Text>
        ) : (
          <ActivityIndicator color={colors.brand} />
        )}
      </View>
    );
  }

  const movie = { ...toMovie(details), runtime: details.runtime || null };
  const myReview = myReviewFor(id);
  const saved = isSaved(id);

  const toggleSave = async () => {
    setSavingWatchlist(true);
    try {
      await toggleWatchlist(movie);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setSavingWatchlist(false);
    }
  };
  const director = details.credits?.crew?.find((person) => person.job === "Director");
  const cast = details.credits?.cast?.slice(0, 10) ?? [];
  const backdrop = details.backdrop_path ? `https://image.tmdb.org/t/p/w780${details.backdrop_path}` : null;

  const allReviews = reviews ?? [];
  const fromFollowing = allReviews.filter((review) => followingIds.has(review.user_id) || review.user_id === user.id);
  const fromOthers = allReviews.filter((review) => !fromFollowing.includes(review));

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.brand} />}
    >
      {/* Backdrop fading into the page */}
      <View style={styles.backdrop}>
        {backdrop && <Image source={backdrop} style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} contentFit="cover" />}
        <LinearGradient colors={["rgba(9,9,13,0.3)", "rgba(9,9,13,0.6)", colors.ink]} style={StyleSheet.absoluteFill} />
      </View>

      <View style={styles.main}>
        <View style={styles.top}>
          <View style={styles.poster}>
            <Image source={posterUrl(details.poster_path, "w342")} style={StyleSheet.absoluteFill} contentFit="cover" />
          </View>
          <View style={styles.topText}>
            <Text style={styles.title}>{details.title}</Text>
            <Text style={styles.soft}>
              {[releaseYear(details.release_date), formatRuntime(details.runtime)].filter(Boolean).join(" · ")}
            </Text>
            {director && (
              <Text style={styles.soft}>
                Directed by <Text style={{ color: colors.fg, fontWeight: "600" }}>{director.name}</Text>
              </Text>
            )}
          </View>
        </View>

        {details.genres?.length > 0 && (
          <View style={styles.genres}>
            {details.genres.map((genre) => (
              <Text key={genre.id} style={styles.genre}>
                {genre.name}
              </Text>
            ))}
          </View>
        )}

        {details.tagline ? <Text style={styles.tagline}>“{details.tagline}”</Text> : null}
        {details.overview ? <Text style={styles.overview}>{details.overview}</Text> : null}

        <Pressable
          onPress={() => openReview(movie)}
          style={({ pressed }) => [styles.action, myReview ? styles.actionEdit : styles.actionNew, pressed && { opacity: 0.85 }]}
        >
          <Ionicons name={myReview ? "create-outline" : "star-outline"} size={18} color={myReview ? colors.star : "#fff"} />
          <Text style={[styles.actionText, myReview && { color: colors.star }]}>
            {myReview ? `Your rating: ★ ${Number(myReview.rating)} · Edit` : "Rate & review"}
          </Text>
        </Pressable>
        {(!myReview || saved) && (
          <Pressable
            onPress={toggleSave}
            disabled={savingWatchlist}
            style={({ pressed }) => [styles.action, styles.actionSecondary, (pressed || savingWatchlist) && { opacity: 0.7 }]}
          >
            <Ionicons name={saved ? "bookmark" : "bookmark-outline"} size={18} color={colors.fg} />
            <Text style={[styles.actionText, { color: colors.fg }]}>{saved ? "On your watchlist" : "Add to watchlist"}</Text>
          </Pressable>
        )}

        {/* Only ratings from people on JustSeen: friends first, no critic scores */}
        <View style={styles.averages}>
          {[
            { label: "PEOPLE YOU FOLLOW", value: average(fromFollowing), count: fromFollowing.length },
            { label: "EVERYONE ON JUSTSEEN", value: average(allReviews), count: allReviews.length },
          ].map((rating) => (
            <View key={rating.label} style={styles.average}>
              <Text style={styles.averageLabel}>{rating.label}</Text>
              <Text style={styles.averageValue}>
                {rating.value ? `★ ${rating.value}` : "—"}
                <Text style={styles.averageCount}>
                  {"  "}
                  {rating.count ? `${rating.count} ${rating.count === 1 ? "rating" : "ratings"}` : "no ratings"}
                </Text>
              </Text>
            </View>
          ))}
        </View>

        {cast.length > 0 && (
          <>
            <Text style={styles.section}>Top cast</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cast}>
              {cast.map((person) => (
                <View key={person.credit_id} style={styles.castMember}>
                  <View style={styles.castPhoto}>
                    {person.profile_path && (
                      <Image source={`https://image.tmdb.org/t/p/w185${person.profile_path}`} style={StyleSheet.absoluteFill} contentFit="cover" />
                    )}
                  </View>
                  <Text style={styles.castName} numberOfLines={2}>
                    {person.name}
                  </Text>
                  <Text style={styles.castRole} numberOfLines={2}>
                    {person.character}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        <Text style={styles.section}>Reviews on JustSeen</Text>
        {reviews === null && <ActivityIndicator color={colors.brand} style={{ marginTop: 16 }} />}
        {reviews && allReviews.length === 0 && <Text style={styles.soft}>Nobody has reviewed this yet. Be the first!</Text>}

        {fromFollowing.length > 0 && (
          <>
            <Text style={styles.subsection}>From you and people you follow</Text>
            <View style={styles.reviews}>
              {fromFollowing.map((review) => (
                <ReviewCard key={review.id} review={review} compact />
              ))}
            </View>
          </>
        )}
        {fromOthers.length > 0 && (
          <>
            <Text style={styles.subsection}>From everyone else</Text>
            <View style={styles.reviews}>
              {fromOthers.map((review) => (
                <ReviewCard key={review.id} review={review} compact />
              ))}
            </View>
          </>
        )}

        <Text style={styles.credit} onPress={() => Linking.openURL(`https://www.themoviedb.org/movie/${id}`)}>
          Movie data and images from TMDB.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  content: { paddingBottom: 48 },
  backdrop: { height: 260, backgroundColor: colors.panel },
  main: { marginTop: -130, paddingHorizontal: 16, gap: 14 },
  top: { flexDirection: "row", alignItems: "flex-end", gap: 16 },
  poster: {
    width: 120,
    aspectRatio: 2 / 3,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  topText: { flex: 1, gap: 4, paddingBottom: 4 },
  title: { color: colors.fg, fontSize: 24, fontWeight: "800", lineHeight: 29 },
  soft: { color: colors.soft, fontSize: 14, lineHeight: 20 },
  muted: { color: colors.muted, fontSize: 15, textAlign: "center" },
  genres: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  genre: {
    color: colors.soft,
    fontSize: 12,
    fontWeight: "500",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  tagline: { color: colors.soft, fontSize: 16, fontStyle: "italic" },
  overview: { color: colors.soft, fontSize: 15, lineHeight: 22 },
  action: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 999,
    marginTop: 4,
  },
  actionNew: { backgroundColor: colors.brand },
  actionEdit: { backgroundColor: "rgba(245,158,11,0.15)", borderWidth: 1, borderColor: "rgba(245,158,11,0.4)" },
  actionSecondary: { borderWidth: 1, borderColor: colors.lineStrong, marginTop: 0 },
  actionText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  averages: { flexDirection: "row", gap: 10 },
  average: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, gap: 4 },
  averageLabel: { color: colors.muted, fontSize: 10, fontWeight: "600", letterSpacing: 0.6 },
  averageValue: { color: colors.fg, fontSize: 19, fontWeight: "800" },
  averageCount: { color: colors.muted, fontSize: 12, fontWeight: "400" },
  section: { color: colors.fg, fontSize: 19, fontWeight: "800", marginTop: 18 },
  subsection: { color: colors.muted, fontSize: 13, fontWeight: "700", marginTop: 4 },
  cast: { gap: 14, paddingRight: 16 },
  castMember: { width: 84, alignItems: "center", gap: 4 },
  castPhoto: { width: 76, height: 76, borderRadius: 38, overflow: "hidden", backgroundColor: colors.panel2 },
  castName: { color: colors.fg, fontSize: 12, fontWeight: "600", textAlign: "center" },
  castRole: { color: colors.muted, fontSize: 11, textAlign: "center" },
  reviews: { gap: 16 },
  credit: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 24, textDecorationLine: "underline" },
});
