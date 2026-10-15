import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { openReview, openShare } from "../lib/navigation";
import { colors } from "../lib/theme";
import { titleOf } from "../../../shared/titles";
import { BookmarkIcon, PencilIcon, ShareIcon, StarPlusIcon } from "./icons";

/* The quick actions on a review: review it (or edit my review, amber pencil), share it
(my own reviews), and save it to my watchlist (until I've reviewed it). `review` is any
review of the movie or show.
- inline (the feed): bigger buttons in a row, next to who watched it and when
- otherwise: one small frosted pill on the poster, like the website's MovieCard */
const PosterActions = ({ review, inline = false }) => {
  const { user } = useAuth();
  const { myReviewFor, isSaved, toggleWatchlist } = useLibrary();
  const [saving, setSaving] = useState(false);

  const movie = titleOf(review);
  const isMine = review.user_id === user?.id;
  const myReview = myReviewFor(movie);
  const saved = isSaved(movie);
  const size = inline ? 21 : 16;
  /* On a poster the icons are white; in the card they match its text */
  const color = inline ? colors.soft : "#fff";

  const toggleSave = async () => {
    setSaving(true);
    try {
      await toggleWatchlist(movie);
    } catch (error) {
      console.error("Failed to update watchlist:", error);
    } finally {
      setSaving(false);
    }
  };

  const share = () =>
    openShare({ reviewId: review.id, movie, rating: review.rating, review: review.review, author: review.author ?? user });

  return (
    <View style={inline ? styles.row : styles.pill}>
      <Button inline={inline} label={myReview ? "Edit your review" : "Write a review"} onPress={() => openReview(movie)}>
        {myReview ? <PencilIcon size={size} color="#fbbf24" /> : <StarPlusIcon size={size} color={color} />}
      </Button>
      {isMine && (
        <Button inline={inline} label="Share your review" onPress={share}>
          <ShareIcon size={size} color={color} />
        </Button>
      )}
      {(!myReview || saved) && (
        <Button inline={inline} label={saved ? "Remove from watchlist" : "Add to watchlist"} onPress={toggleSave} disabled={saving}>
          <BookmarkIcon size={size} filled={saved} color={saved ? colors.brandSoft : color} />
        </Button>
      )}
    </View>
  );
};

const Button = ({ label, onPress, disabled, inline, children }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [
      inline ? styles.inlineButton : styles.button,
      (pressed || disabled) && { backgroundColor: inline ? colors.panel2 : "rgba(255,255,255,0.15)" },
    ]}
  >
    {children}
  </Pressable>
);

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 2,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.45)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  button: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 2 },
  inlineButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});

export default PosterActions;
