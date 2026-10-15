import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { getProfileByUsername } from "../../data/people";
import { getYearReviews } from "../../data/reviews";
import { openProfile, openTitle } from "../../lib/navigation";
import { posterUrl } from "../../lib/tmdb";
import { colors } from "../../lib/theme";
import Avatar from "../../components/Avatar";
import BarChart from "../../components/BarChart";
import { yearStats } from "../../../../shared/yearStats";
import { formatDay, releaseYear } from "../../../../shared/dates";
import { countLabel, isShow } from "../../../../shared/titles";

/* Someone's year in film: how many movies and shows, hours, favourites and moments, worked out
by the same shared/yearStats.js as the website (/year/<username>?year=2026) */
export default function YearScreen() {
  const params = useLocalSearchParams();
  const thisYear = new Date().getFullYear();
  const year = Number(params.year) || thisYear;
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [reviews, setReviews] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "missing" | "error"

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    (async () => {
      try {
        const found = await getProfileByUsername(params.username);
        if (cancelled) return;
        if (!found) return setStatus("missing");
        const list = await getYearReviews(found.id, year);
        if (cancelled) return;
        setPerson(found);
        setReviews(list);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load year in film:", error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.username, year]);

  const goToYear = (next) => router.setParams({ year: String(next) });

  if (status !== "ready") {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: `${year} in film` }} />
        {status === "loading" ? (
          <ActivityIndicator color={colors.brand} />
        ) : (
          <Text style={styles.muted}>We couldn't find that year in film.</Text>
        )}
      </View>
    );
  }

  const isMe = person.id === user.id;
  const firstName = person.name.split(" ")[0];
  const stats = yearStats(reviews);

  const yearNav = (
    <View style={styles.yearNav}>
      <Pressable onPress={() => goToYear(year - 1)} hitSlop={8} style={styles.yearButton}>
        <Text style={styles.yearButtonText}>← {year - 1}</Text>
      </Pressable>
      {year < thisYear && (
        <Pressable onPress={() => goToYear(year + 1)} hitSlop={8} style={styles.yearButton}>
          <Text style={styles.yearButtonText}>{year + 1} →</Text>
        </Pressable>
      )}
    </View>
  );

  if (stats.count === 0) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Stack.Screen options={{ title: `${year} in film` }} />
        {yearNav}
        <View style={styles.emptyBox}>
          <Text style={styles.emptyEmoji}>📽️</Text>
          <Text style={styles.emptyTitle}>Nothing logged in {year}</Text>
          <Text style={styles.muted}>
            {isMe
              ? "Review the movies and shows you watch and your year in film builds itself."
              : `${firstName} didn't log anything in ${year}.`}
          </Text>
        </View>
      </ScrollView>
    );
  }

  const bigNumbers = [
    { value: stats.movies, label: stats.movies === 1 ? "movie" : "movies" },
    /* Shows only once there are some */
    ...(stats.shows ? [{ value: stats.shows, label: stats.shows === 1 ? "TV show" : "TV shows" }] : []),
    {
      value: stats.hours,
      label: `${stats.hours === 1 ? "hour" : "hours"}${stats.shows ? " of movies" : ""}`,
      note: stats.missingRuntime ? `${stats.missingRuntime} without runtime` : null,
    },
    { value: stats.average ? `★ ${stats.average}` : "—", label: "average rating" },
    { value: stats.streak, label: stats.streak === 1 ? "day streak" : "days in a row" },
  ];

  const critic =
    Number(stats.average) >= 4
      ? "A generous critic: most of what you watched won you over."
      : Number(stats.average) >= 3
        ? "A fair critic: the good ones earned it."
        : "A tough critic: everything had to work for it.";

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `${year} in film` }} />

      {/* Opening */}
      <LinearGradient colors={[colors.brand, "#d946ef"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTop}>
          <Pressable onPress={() => openProfile(person.username)} style={styles.heroWho}>
            <Avatar user={person} size={34} />
            <Text style={styles.heroName}>{person.name}</Text>
          </Pressable>
        </View>
        <Text style={styles.kickerLight}>{isMe ? "YOUR" : `${firstName.toUpperCase()}'S`} YEAR IN FILM</Text>
        <Text style={styles.heroYear}>{year}</Text>
        <Text style={styles.heroText}>
          {[stats.movies && countLabel(stats.movies), stats.shows && countLabel(stats.shows, "tv")].filter(Boolean).join(" and ")}
          {stats.hours > 0 && `, about ${stats.hours} ${stats.hours === 1 ? "hour" : "hours"} in front of the screen`}
          {stats.topGenres[0] && `, and a soft spot for ${stats.topGenres[0].name.toLowerCase()}`}.
        </Text>
      </LinearGradient>
      {yearNav}

      {/* Headline numbers */}
      <View style={styles.grid}>
        {bigNumbers.map((item) => (
          <View key={item.label} style={[styles.panel, styles.half]}>
            <Text style={styles.bigValue}>{item.value}</Text>
            <Text style={styles.muted}>{item.label}</Text>
            {item.note && <Text style={styles.note}>{item.note}</Text>}
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.kicker}>MONTH BY MONTH</Text>
        {stats.busiestMonth && (
          <Text style={styles.sentence}>
            <Text style={{ fontWeight: "700" }}>{stats.busiestMonth}</Text> was the busiest month, with {stats.busiestCount} watched.
          </Text>
        )}
        <BarChart data={stats.perMonth} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.kicker}>HOW {isMe ? "YOU" : firstName.toUpperCase()} RATED</Text>
        <Text style={styles.sentence}>{critic}</Text>
        <BarChart data={stats.ratingSpread} />
        <Text style={[styles.note, { textAlign: "center" }]}>stars</Text>
      </View>

      {stats.favorite && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>FAVOURITE OF THE YEAR</Text>
          <MovieChip review={stats.favorite} caption={`★ ${Number(stats.favorite.rating)}`} captionColor={colors.star} />
          {stats.favorite.review ? <Text style={styles.quote}>“{stats.favorite.review}”</Text> : null}
        </View>
      )}

      {stats.topGenres.length > 0 && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>TOP GENRES</Text>
          {stats.topGenres.map((genre, index) => (
            <View key={genre.name} style={styles.genreRow}>
              <Text style={styles.genreRank}>{index + 1}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.genreTop}>
                  <Text style={styles.genreName}>{genre.name}</Text>
                  <Text style={styles.muted}>{genre.count}</Text>
                </View>
                <View style={styles.genreTrack}>
                  <View style={[styles.genreBar, { width: `${(genre.count / stats.topGenres[0].count) * 100}%` }]} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {stats.first && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>FIRST OF THE YEAR</Text>
          <MovieChip review={stats.first} caption={formatDay(stats.first.watched_on, { full: true })} />
        </View>
      )}
      {stats.latest && stats.latest.id !== stats.first?.id && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>MOST RECENT</Text>
          <MovieChip review={stats.latest} caption={formatDay(stats.latest.watched_on, { full: true })} />
        </View>
      )}
      {stats.oldest && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>TIME CAPSULE</Text>
          <MovieChip
            review={stats.oldest}
            caption={`The oldest ${isShow(stats.oldest) ? "show" : "movie"} ${isMe ? "you" : firstName} watched, from ${releaseYear(stats.oldest.release_date)}`}
          />
        </View>
      )}
      {stats.letdown && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>BIGGEST LETDOWN</Text>
          <MovieChip review={stats.letdown} caption={`Only ${Number(stats.letdown.rating)} ★`} />
        </View>
      )}
      {stats.mostAgreed && (
        <View style={styles.panel}>
          <Text style={styles.kicker}>MOST AGREED-WITH REVIEW</Text>
          <MovieChip
            review={stats.mostAgreed.review}
            caption={`${stats.mostAgreed.agrees} ${stats.mostAgreed.agrees === 1 ? "person" : "people"} agreed`}
          />
          {stats.mostAgreed.review.review ? <Text style={styles.quote}>“{stats.mostAgreed.review.review}”</Text> : null}
        </View>
      )}
    </ScrollView>
  );
}

/* A small poster with the title and a line under it; tap for the movie */
const MovieChip = ({ review, caption, captionColor }) => (
  <Pressable onPress={() => openTitle(review)} style={styles.chip}>
    <Image source={posterUrl(review.poster_path, "w154")} style={styles.chipPoster} contentFit="cover" />
    <View style={{ flex: 1, gap: 3 }}>
      <Text style={styles.chipTitle} numberOfLines={2}>
        {review.title}
      </Text>
      <Text style={[styles.muted, captionColor && { color: captionColor, fontWeight: "700" }]}>{caption}</Text>
    </View>
    <Ionicons name="chevron-forward" size={18} color={colors.muted} />
  </Pressable>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  content: { padding: 16, paddingBottom: 48, gap: 12 },
  muted: { color: colors.muted, fontSize: 14 },
  note: { color: colors.muted, fontSize: 11 },
  hero: { borderRadius: 24, padding: 22, gap: 6 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  heroWho: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroName: { color: "#fff", fontSize: 15, fontWeight: "600" },
  kickerLight: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: "700", letterSpacing: 1.2 },
  heroYear: { color: "#fff", fontSize: 64, fontWeight: "900", lineHeight: 70 },
  heroText: { color: "rgba(255,255,255,0.9)", fontSize: 16, lineHeight: 23 },
  yearNav: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  yearButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.panel2 },
  yearButtonText: { color: colors.soft, fontSize: 13, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  half: { width: "47%", flexGrow: 1 },
  panel: { backgroundColor: colors.panel, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 18, gap: 12 },
  bigValue: { color: colors.fg, fontSize: 32, fontWeight: "800" },
  kicker: { color: colors.muted, fontSize: 11, fontWeight: "700", letterSpacing: 1.2 },
  sentence: { color: colors.fg, fontSize: 16, lineHeight: 22 },
  quote: { color: colors.soft, fontSize: 15, lineHeight: 22 },
  genreRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  genreRank: { width: 16, color: colors.muted, fontSize: 13, fontWeight: "700", textAlign: "right" },
  genreTop: { flexDirection: "row", justifyContent: "space-between" },
  genreName: { color: colors.fg, fontSize: 14, fontWeight: "600" },
  genreTrack: { height: 8, borderRadius: 4, backgroundColor: colors.panel2 },
  genreBar: { height: 8, borderRadius: 4, backgroundColor: colors.brand },
  chip: { flexDirection: "row", alignItems: "center", gap: 12 },
  chipPoster: { width: 46, aspectRatio: 2 / 3, borderRadius: 6, backgroundColor: colors.panel2 },
  chipTitle: { color: colors.fg, fontSize: 15, fontWeight: "700" },
  emptyBox: { alignItems: "center", gap: 8, paddingTop: 64 },
  emptyEmoji: { fontSize: 44 },
  emptyTitle: { color: colors.fg, fontSize: 18, fontWeight: "700" },
});
