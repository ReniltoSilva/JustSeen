import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { movieOf, openReview, openShare } from "../lib/navigation";
import { colors } from "../lib/theme";
import { BookmarkIcon, PencilIcon, ShareIcon, StarPlusIcon } from "./icons";

/* The quick actions on a poster, in one frosted pill like the website's MovieCard:
review it (or edit my review, amber pencil), share it (my own reviews), and save it
to my watchlist (until I've reviewed it). `review` is any review of the movie */
const PosterActions = ({ review }) => {
  const { user } = useAuth();
  const { myReviewFor, isSaved, toggleWatchlist } = useLibrary();
  const [saving, setSaving] = useState(false);

  const movie = movieOf(review);
  const isMine = review.user_id === user?.id;
  const myReview = myReviewFor(review.movie_id);
  const saved = isSaved(review.movie_id);

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
    <View style={styles.pill}>
      <Button label={myReview ? "Edit your review" : "Write a review"} onPress={() => openReview(movie)}>
        {myReview ? <PencilIcon color="#fbbf24" /> : <StarPlusIcon />}
      </Button>
      {isMine && (
        <Button label="Share your review" onPress={share}>
          <ShareIcon />
        </Button>
      )}
      {(!myReview || saved) && (
        <Button label={saved ? "Remove from watchlist" : "Add to watchlist"} onPress={toggleSave} disabled={saving}>
          <BookmarkIcon filled={saved} color={saved ? colors.brandSoft : "#fff"} />
        </Button>
      )}
    </View>
  );
};

const Button = ({ label, onPress, disabled, children }) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    hitSlop={4}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={({ pressed }) => [styles.button, (pressed || disabled) && { backgroundColor: "rgba(255,255,255,0.15)" }]}
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
});

export default PosterActions;
