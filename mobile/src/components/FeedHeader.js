import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getFollowCounts, getFollowing } from "../data/people";
import { openFollows, openProfile, openYear } from "../lib/navigation";
import { colors } from "../lib/theme";
import ActivityBell from "./ActivityBell";
import Avatar from "./Avatar";

/* The top of the feed. PREVIEW: four designs to choose from, switched with the chips
above the feed (FeedDesignPicker). Once one is picked, the others and the picker go.
`ownTopBar`: the design replaces the screen's top bar ("Feed" and the bell) itself */
export const feedDesigns = [
  { key: "card", label: "Profile card", ownTopBar: true },
  { key: "big", label: "Big title", ownTopBar: true },
  { key: "friends", label: "Friends row", ownTopBar: false },
  { key: "simple", label: "Simple", ownTopBar: false },
];

const tagline = "What the people you follow are watching";

const FeedHeader = ({ design }) => {
  if (design === "card") return <ProfileCard />;
  if (design === "big") return <BigTitle />;
  if (design === "friends") return <FriendsRow />;
  return <Text style={styles.simple}>{tagline}, newest first.</Text>;
};

/* A: my own card at the top, with the bell, instead of the "Feed" bar */
const ProfileCard = () => {
  const { user } = useAuth();
  const { myReviews, followingIds, version } = useLibrary();
  const [followers, setFollowers] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getFollowCounts(user.id)
      .then((counts) => !cancelled && setFollowers(counts.followers))
      .catch((error) => console.error("Failed to load follower count:", error));
    return () => {
      cancelled = true;
    };
  }, [user.id, version]);

  const firstName = user.name.split(" ")[0];
  const stats = [
    { label: "watched", value: myReviews.size, onPress: () => router.navigate("/watched") },
    { label: "following", value: followingIds.size, onPress: () => openFollows(user.username, "following") },
    { label: "followers", value: followers ?? "·", onPress: () => openFollows(user.username, "followers") },
  ];

  return (
    <View style={styles.cardWrap}>
      <LinearGradient colors={["rgba(124,92,255,0.28)", colors.panel]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
        <View style={styles.cardTop}>
          <Pressable onPress={() => router.navigate("/profile")} style={styles.cardWho}>
            <View style={styles.avatarRing}>
              <Avatar user={user} size={50} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hello} numberOfLines={1}>
                Hi, {firstName}
              </Text>
              <Text style={styles.muted}>@{user.username}</Text>
            </View>
          </Pressable>
          <ActivityBell style={{ marginRight: 0 }} />
        </View>
        <View style={styles.cardStats}>
          {stats.map((stat) => (
            <Pressable key={stat.label} onPress={stat.onPress} style={({ pressed }) => [styles.cardStat, pressed && { opacity: 0.7 }]}>
              <Text style={styles.cardStatValue}>{stat.value}</Text>
              <Text style={styles.cardStatLabel}>{stat.label}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => openYear(user.username)} style={({ pressed }) => pressed && { opacity: 0.85 }}>
            <LinearGradient colors={[colors.brand, "#d946ef"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.yearChip}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.yearChipText}>{new Date().getFullYear()}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>
      <Text style={styles.sectionTitle}>Your feed</Text>
      <Text style={styles.muted}>{tagline}.</Text>
    </View>
  );
};

/* B: a big "Feed" title with the line under it straight away, and the bell beside it */
const BigTitle = () => (
  <View style={styles.big}>
    <View style={styles.bigRow}>
      <Text style={styles.bigTitle}>Feed</Text>
      <ActivityBell style={{ marginRight: 0 }} />
    </View>
    <Text style={styles.bigLine}>{tagline}.</Text>
  </View>
);

/* C: "JustSeen" in the top bar; the faces of the people I follow, then the line */
const FriendsRow = () => {
  const { user } = useAuth();
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
    <View style={styles.friends}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.friendsRow}>
        <Face person={user} label="You" onPress={() => router.navigate("/profile")} />
        {following.map((person) => (
          <Face key={person.id} person={person} label={person.name.split(" ")[0]} onPress={() => openProfile(person.username)} />
        ))}
        <Pressable onPress={() => router.navigate("/search")} style={styles.face}>
          <View style={styles.findCircle}>
            <Ionicons name="person-add-outline" size={22} color={colors.brandSoft} />
          </View>
          <Text style={styles.faceLabel}>Find</Text>
        </Pressable>
      </ScrollView>
      <Text style={styles.muted}>{tagline}.</Text>
    </View>
  );
};

const Face = ({ person, label, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.face, pressed && { opacity: 0.7 }]}>
    <View style={styles.faceRing}>
      <Avatar user={person} size={52} />
    </View>
    <Text style={styles.faceLabel} numberOfLines={1}>
      {label}
    </Text>
  </Pressable>
);

/* PREVIEW ONLY: the chips that switch between the designs above */
export const FeedDesignPicker = ({ design, onChange }) => (
  <View style={styles.picker}>
    <Text style={styles.pickerLabel}>PREVIEW · PICK A FEED DESIGN</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {feedDesigns.map((option, index) => (
        <Pressable
          key={option.key}
          onPress={() => onChange(option.key)}
          style={[styles.pickerChip, design === option.key && styles.pickerChipActive]}
        >
          <Text style={[styles.pickerText, design === option.key && { color: colors.fg }]}>
            {String.fromCharCode(65 + index)} · {option.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  muted: { color: colors.muted, fontSize: 14 },
  simple: { color: colors.muted, fontSize: 14, marginBottom: 14 },
  /* A */
  cardWrap: { gap: 4, marginBottom: 16 },
  card: { borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 14, marginBottom: 14 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  cardWho: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  avatarRing: { borderRadius: 999, borderWidth: 2, borderColor: colors.brand, padding: 2 },
  hello: { color: colors.fg, fontSize: 20, fontWeight: "800" },
  cardStats: { flexDirection: "row", alignItems: "center", gap: 18 },
  cardStat: { alignItems: "flex-start" },
  cardStatValue: { color: colors.fg, fontSize: 17, fontWeight: "800" },
  cardStatLabel: { color: colors.muted, fontSize: 12 },
  yearChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, marginLeft: "auto" },
  yearChipText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  sectionTitle: { color: colors.fg, fontSize: 18, fontWeight: "800" },
  /* B */
  big: { gap: 2, marginBottom: 16 },
  bigRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bigTitle: { color: colors.fg, fontSize: 34, fontWeight: "800", letterSpacing: -0.5 },
  bigLine: { color: colors.soft, fontSize: 15 },
  /* C */
  friends: { gap: 10, marginBottom: 16 },
  friendsRow: { gap: 14, paddingRight: 8 },
  face: { width: 62, alignItems: "center", gap: 5 },
  faceRing: { borderRadius: 999, borderWidth: 2, borderColor: colors.brand, padding: 2 },
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
  faceLabel: { color: colors.soft, fontSize: 12, fontWeight: "500" },
  /* Picker */
  picker: { gap: 6, marginBottom: 14, padding: 10, borderRadius: 14, borderWidth: 1, borderStyle: "dashed", borderColor: colors.lineStrong },
  pickerLabel: { color: colors.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  pickerChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.panel2 },
  pickerChipActive: { backgroundColor: colors.brand },
  pickerText: { color: colors.soft, fontSize: 13, fontWeight: "600" },
});

export default FeedHeader;
