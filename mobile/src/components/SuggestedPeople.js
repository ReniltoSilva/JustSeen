import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { openProfile } from "../lib/navigation";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";
import { suggestionNote } from "../../../shared/suggestions";

/* "People you may know" as a row of cards you swipe through: face, name, why they're
suggested and a Follow button. `suggestions` comes from useSuggestions() */
const SuggestedPeople = ({ suggestions, title = "People you may know" }) => {
  if (!suggestions?.length) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{title}</Text>
      <FlatList
        horizontal
        data={suggestions}
        keyExtractor={(item) => item.profile.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openProfile(item.profile.username)}
            style={({ pressed }) => [styles.card, pressed && { backgroundColor: colors.panel2 }]}
          >
            <Avatar user={item.profile} size={56} />
            <Text style={styles.name} numberOfLines={1}>
              {item.profile.name}
            </Text>
            <Text style={styles.note} numberOfLines={2}>
              {suggestionNote(item)}
            </Text>
            <FollowButton person={item.profile} />
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: 10, paddingTop: 8, marginHorizontal: -8, marginBottom: 8 },
  heading: { color: colors.fg, fontSize: 16, fontWeight: "800", paddingHorizontal: 16 },
  row: { gap: 10, paddingHorizontal: 16 },
  card: {
    width: 150,
    alignItems: "center",
    gap: 6,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
  },
  name: { color: colors.fg, fontSize: 14, fontWeight: "700", marginTop: 2 },
  note: { color: colors.muted, fontSize: 12, lineHeight: 16, textAlign: "center", minHeight: 32 },
});

export default SuggestedPeople;
