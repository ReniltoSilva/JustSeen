import { useEffect, useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { setReaction } from "../data/reviews";
import { openProfile } from "../lib/navigation";
import { colors } from "../lib/theme";
import Avatar, { AvatarRing } from "./Avatar";

/* Each reaction has its own colour: green agree, grey unsure, red disagree */
const kinds = [
  { kind: "agree", label: "Agree", icon: "thumbs-up", color: colors.agree },
  { kind: "unsure", label: "Not sure", icon: "remove-circle", color: colors.unsure },
  { kind: "disagree", label: "Disagree", icon: "thumbs-down", color: colors.disagree },
];
const kindInfo = Object.fromEntries(kinds.map((item) => [item.kind, item]));

/* The agree / not sure / disagree buttons under a review, plus who reacted.
Tapping a reaction adds it, tapping it again takes it back, another one moves it */
const ReactionBar = ({ review }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState(review.reactions ?? []);
  const [saving, setSaving] = useState(false);
  const [showWho, setShowWho] = useState(false);

  /* A reloaded feed brings fresh reactions */
  useEffect(() => setReactions(review.reactions ?? []), [review.reactions]);

  const isMine = user?.id === review.user_id;
  const mine = reactions.find((reaction) => reaction.user_id === user?.id)?.kind ?? null;
  const count = (kind) => reactions.filter((reaction) => reaction.kind === kind).length;
  const reactors = reactions.filter((reaction) => reaction.profile);

  const react = async (kind) => {
    if (!user || isMine || saving) return;
    const next = mine === kind ? null : kind;
    const previous = reactions;

    /* Show it straight away, undo if saving fails */
    const others = reactions.filter((reaction) => reaction.user_id !== user.id);
    setReactions(next ? [...others, { user_id: user.id, kind: next, profile: user }] : others);
    setSaving(true);
    try {
      await setReaction(user.id, review.id, next);
    } catch (error) {
      console.error("Failed to save reaction:", error);
      setReactions(previous);
    } finally {
      setSaving(false);
    }
  };

  const goToProfile = (username) => {
    setShowWho(false);
    openProfile(username);
  };

  return (
    <View style={styles.bar}>
      <View style={styles.buttons}>
        {kinds.map(({ kind, label, icon, color }) => {
          const active = mine === kind;
          return (
            <Pressable
              key={kind}
              onPress={() => react(kind)}
              disabled={isMine}
              hitSlop={4}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`${label} (${count(kind)})`}
              style={[styles.button, active && { backgroundColor: `${color}26`, borderColor: `${color}66` }]}
            >
              <Ionicons name={active ? icon : `${icon}-outline`} size={15} color={color} />
              <Text style={[styles.count, { color }]}>{count(kind)}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Stacked faces of people who reacted; tap to see the full list */}
      {reactors.length > 0 && (
        <Pressable onPress={() => setShowWho(true)} hitSlop={8} style={styles.faces} accessibilityLabel={`See who reacted (${reactors.length})`}>
          {reactors.slice(0, 3).map((reaction, i) => (
            <View key={reaction.user_id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
              <AvatarRing color={colors.panel}>
                <Avatar user={reaction.profile} size={20} />
              </AvatarRing>
            </View>
          ))}
        </Pressable>
      )}

      <Modal visible={showWho} transparent animationType="fade" onRequestClose={() => setShowWho(false)}>
        <View style={styles.backdrop}>
          {/* Tapping the dimmed area closes it; it sits behind the list so the list still scrolls */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowWho(false)} accessibilityLabel="Close" />
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Reactions</Text>
            <FlatList
              data={reactors}
              keyExtractor={(reaction) => reaction.user_id}
              renderItem={({ item }) => {
                const info = kindInfo[item.kind];
                return (
                  <Pressable onPress={() => goToProfile(item.profile.username)} style={({ pressed }) => [styles.person, pressed && { backgroundColor: colors.panel2 }]}>
                    <Avatar user={item.profile} size={32} />
                    <Text style={styles.personName} numberOfLines={1}>
                      {item.profile.name}
                    </Text>
                    {info && <Ionicons name={info.icon} size={16} color={info.color} />}
                  </Pressable>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  buttons: { flexDirection: "row", gap: 6, marginLeft: -6 },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "transparent",
  },
  count: { fontSize: 12, fontWeight: "600" },
  faces: { flexDirection: "row" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: {
    maxHeight: "60%",
    backgroundColor: colors.panel,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 12,
    paddingBottom: 32,
  },
  sheetTitle: { color: colors.muted, fontSize: 13, fontWeight: "700", padding: 8 },
  person: { flexDirection: "row", alignItems: "center", gap: 12, padding: 8, borderRadius: 12 },
  personName: { flex: 1, color: colors.fg, fontSize: 15 },
});

export default ReactionBar;
