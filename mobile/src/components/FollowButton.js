import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useLibrary } from "../library/LibraryContext";
import { colors } from "../lib/theme";

/* Follow / Following, for someone else's profile */
const FollowButton = ({ person }) => {
  const { isFollowing, toggleFollow } = useLibrary();
  const [busy, setBusy] = useState(false);
  const following = isFollowing(person.id);

  const toggle = async () => {
    setBusy(true);
    try {
      await toggleFollow(person.id);
    } catch (error) {
      console.error("Failed to update follow:", error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Pressable
      onPress={toggle}
      disabled={busy}
      style={({ pressed }) => [styles.button, following ? styles.following : styles.follow, pressed && { opacity: 0.8 }]}
    >
      {busy ? (
        <ActivityIndicator size="small" color={following ? colors.fg : "#fff"} />
      ) : (
        <Text style={[styles.text, following && { color: colors.fg }]}>{following ? "Following" : "Follow"}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: { minWidth: 104, height: 38, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  follow: { backgroundColor: colors.brand },
  following: { borderWidth: 1, borderColor: colors.lineStrong },
  text: { color: "#fff", fontSize: 14, fontWeight: "700" },
});

export default FollowButton;
