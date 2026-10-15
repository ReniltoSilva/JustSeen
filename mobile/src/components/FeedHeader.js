import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getFollowing } from "../data/people";
import { openProfile } from "../lib/navigation";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";

/* The top of the feed, a bit like Instagram's stories: me and the faces of the people
I follow (tap for their profile), a button to find more, then what the feed is */
const FeedHeader = () => {
  const { user } = useAuth();
  /* Goes up when I follow or unfollow someone, so the row updates */
  const { version } = useLibrary();
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getFollowing(user.id)
      .then((people) => !cancelled && setFollowing(people))
      .catch((error) => console.error("Failed to load who I follow:", error));
    return () => {
      cancelled = true;
    };
  }, [user.id, version]);

  return (
    <View style={styles.header}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Face person={user} label="You" onPress={() => router.navigate("/profile")} />
        {following.map((person) => (
          <Face key={person.id} person={person} label={person.name.split(" ")[0]} onPress={() => openProfile(person.username)} />
        ))}
        <Pressable onPress={() => router.navigate("/search")} style={({ pressed }) => [styles.face, pressed && { opacity: 0.7 }]}>
          <View style={styles.findCircle}>
            <Ionicons name="person-add-outline" size={22} color={colors.brandSoft} />
          </View>
          <Text style={styles.label}>Find</Text>
        </Pressable>
      </ScrollView>
      <Text style={styles.tagline}>What the people you follow are watching.</Text>
    </View>
  );
};

const Face = ({ person, label, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.face, pressed && { opacity: 0.7 }]}>
    <View style={styles.ring}>
      <Avatar user={person} size={52} />
    </View>
    <Text style={styles.label} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  header: { gap: 10, marginBottom: 16 },
  row: { gap: 14, paddingRight: 8 },
  face: { width: 62, alignItems: "center", gap: 5 },
  ring: { borderRadius: 999, borderWidth: 2, borderColor: colors.brand, padding: 2 },
  findCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.brandSoft,
  },
  label: { color: colors.soft, fontSize: 12, fontWeight: "500" },
  tagline: { color: colors.muted, fontSize: 14 },
});

export default FeedHeader;
