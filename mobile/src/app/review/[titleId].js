import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import StarPicker from "../../components/StarPicker";
import { useLibrary } from "../../library/LibraryContext";
import { getTitleDetails, posterUrl } from "../../lib/tmdb";
import { isShow, toTitle } from "../../../../shared/titles";
import { closeSheet, openShare, parseTitleParam, pendingTitle } from "../../lib/navigation";
import { useAuth } from "../../auth/AuthContext";
import { colors } from "../../lib/theme";
import { addDays, formatDay, releaseYear, toDay } from "../../../../shared/dates";
import { useToday } from "../../lib/useToday";

/* Short enough that cards can always show the whole review (the database checks it too) */
const maxReviewLength = 250;

/* "2026-10-14" as a Date at midday, for the calendar, so it can't slip to another day */
const fromDay = (day) => new Date(`${day}T12:00:00`);

/* Today / Yesterday / Earlier */
const DayChip = ({ label, active, onPress, icon }) => (
  <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
    {icon && <Ionicons name={icon} size={14} color={active ? colors.fg : colors.soft} />}
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

/* Write, edit or delete my review of a movie or show. Opened with openReview() from Search
or a poster (/review/movie-438631, /review/tv-1399). Finds the title first, then shows the form */
export default function ReviewScreen() {
  const { titleId } = useLocalSearchParams();
  const [movie, setMovie] = useState(() => pendingTitle(titleId));
  const [failed, setFailed] = useState(false);

  /* Not handed over (e.g. the app reloaded on this screen): load it from TMDB */
  useEffect(() => {
    if (movie) return;
    const wanted = parseTitleParam(titleId);
    if (!wanted) {
      setFailed(true);
      return;
    }
    let cancelled = false;
    getTitleDetails(wanted.media_type, wanted.movie_id)
      .then((details) => {
        if (cancelled) return;
        setMovie({ ...toTitle(details, wanted.media_type), runtime: wanted.media_type === "tv" ? null : details.runtime || null });
      })
      .catch((error) => {
        console.error("Failed to load the title:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [movie, titleId]);

  const { ready, loadFailed, reload } = useLibrary();

  /* The form waits for my reviews, so it knows whether I already reviewed this title.
  Otherwise an old review would open as a new one and be saved with today's date */
  if (movie && ready) return <ReviewForm movie={movie} />;

  if (movie && loadFailed) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Couldn't load your reviews. Check your connection.</Text>
        <Pressable onPress={reload} hitSlop={12}>
          <Text style={styles.closeText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => closeSheet()} hitSlop={12}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, styles.center]}>
      {failed ? (
        <>
          <Text style={styles.muted}>Couldn't load this title. Check your connection.</Text>
          <Pressable onPress={() => closeSheet()} hitSlop={12}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </>
      ) : (
        <ActivityIndicator color={colors.brand} />
      )}
    </SafeAreaView>
  );
}

const ReviewForm = ({ movie }) => {
  const { user } = useAuth();
  const { myReviewFor, saveMyReview, deleteMyReview } = useLibrary();
  const existing = myReviewFor(movie);

  const [rating, setRating] = useState(Number(existing?.rating) || 0);
  const [review, setReview] = useState(existing?.review ?? "");
  const today = useToday();
  const yesterday = addDays(today, -1);
  const [watchedOn, setWatchedOn] = useState(existing?.watched_on ?? today);
  const [showCalendar, setShowCalendar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isOtherDay = watchedOn !== today && watchedOn !== yesterday;

  /* Android shows its own calendar window; iPhones show one inside the screen */
  const pickDate = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: fromDay(watchedOn),
        mode: "date",
        maximumDate: new Date(),
        onChange: (event, date) => {
          if (event.type === "set" && date) setWatchedOn(toDay(date));
        },
      });
    } else {
      setShowCalendar((open) => !open);
    }
  };

  const save = async () => {
    if (!rating) return;
    setSaving(true);
    setError("");
    try {
      const saved = await saveMyReview(movie, { rating, review, watchedOn });
      /* A brand-new review: offer to share it (edits just close) */
      if (existing) closeSheet();
      else openShare({ reviewId: saved.id, movie, rating, review, author: user, justSaved: true }, { replace: true });
    } catch (err) {
      console.error("Failed to save review:", err);
      setError("Couldn't save your review. Check your connection and try again.");
      setSaving(false);
    }
  };

  const remove = () =>
    Alert.alert("Delete review?", `Your review of ${movie.title} and its reactions will be deleted.`, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setSaving(true);
          setError("");
          try {
            await deleteMyReview(movie);
            closeSheet();
          } catch (err) {
            console.error("Failed to delete review:", err);
            setError("Couldn't delete your review. Try again.");
            setSaving(false);
          }
        },
      },
    ]);


  return (
    <SafeAreaView style={styles.screen} edges={Platform.OS === "android" ? ["top", "bottom"] : ["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.topBar}>
          <Pressable onPress={() => closeSheet()} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={colors.soft} />
          </Pressable>
          <Text style={styles.topTitle}>{existing ? "Edit your review" : "Your review"}</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.movie}>
            <View style={styles.poster}>
              {movie.poster_path && (
                <Image source={posterUrl(movie.poster_path, "w154")} style={StyleSheet.absoluteFill} contentFit="cover" />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.movieTitle}>{movie.title}</Text>
              <Text style={styles.muted}>{[isShow(movie) && "TV show", releaseYear(movie.release_date)].filter(Boolean).join(" · ")}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>RATING</Text>
            <StarPicker value={rating} onChange={setRating} />
            <Text style={styles.muted}>{rating ? `${rating} / 5` : "Tap a star. Tap its left half for a half star."}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>DATE WATCHED</Text>
            <View style={styles.chips}>
              <DayChip label="Today" active={watchedOn === today} onPress={() => setWatchedOn(today)} />
              <DayChip label="Yesterday" active={watchedOn === yesterday} onPress={() => setWatchedOn(yesterday)} />
              <DayChip
                label={isOtherDay ? formatDay(watchedOn) : "Earlier"}
                icon="calendar-outline"
                active={isOtherDay}
                onPress={pickDate}
              />
            </View>
            {showCalendar && Platform.OS === "ios" && (
              <DateTimePicker
                value={fromDay(watchedOn)}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                themeVariant="dark"
                accentColor={colors.brand}
                onChange={(_event, date) => date && setWatchedOn(toDay(date))}
              />
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>REVIEW</Text>
            <TextInput
              value={review}
              onChangeText={setReview}
              placeholder="What did you think?"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={maxReviewLength}
              style={styles.textarea}
              textAlignVertical="top"
            />
            <Text
              style={[
                styles.counter,
                review.length >= maxReviewLength - 30 && { color: colors.star },
                review.length >= maxReviewLength && { color: colors.disagree },
              ]}
            >
              {review.length} / {maxReviewLength}
            </Text>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        <View style={styles.actions}>
          {existing && (
            <Pressable onPress={remove} disabled={saving} hitSlop={8}>
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          )}
          <Pressable
            onPress={save}
            disabled={!rating || saving}
            style={({ pressed }) => [
              styles.saveButton,
              (!rating || saving) && styles.saveDisabled,
              pressed && { opacity: 0.85 },
            ]}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.saveText, !rating && { color: colors.muted }]}>Save review</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.panel },
  center: { alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  closeText: { color: colors.brandSoft, fontSize: 15, fontWeight: "600" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  topTitle: { color: colors.fg, fontSize: 16, fontWeight: "700" },
  content: { padding: 20, gap: 28 },
  movie: { flexDirection: "row", alignItems: "center", gap: 14 },
  poster: { width: 56, aspectRatio: 2 / 3, borderRadius: 8, overflow: "hidden", backgroundColor: colors.panel2 },
  movieTitle: { color: colors.fg, fontSize: 19, fontWeight: "700", lineHeight: 24 },
  muted: { color: colors.muted, fontSize: 14 },
  field: { gap: 10 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.soft, fontSize: 14, fontWeight: "500" },
  chipTextActive: { color: colors.fg, fontWeight: "600" },
  textarea: {
    minHeight: 130,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink,
    color: colors.fg,
    fontSize: 15,
    lineHeight: 22,
    padding: 14,
  },
  counter: { color: colors.muted, fontSize: 12, alignSelf: "flex-end" },
  error: { color: colors.disagree, fontSize: 14 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  deleteText: { color: colors.disagree, fontSize: 15, fontWeight: "600" },
  saveButton: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  saveDisabled: { backgroundColor: colors.panel2 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
