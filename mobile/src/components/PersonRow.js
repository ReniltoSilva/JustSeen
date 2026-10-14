import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { openProfile } from "../lib/navigation";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";
import FollowButton from "./FollowButton";

/* A person in a list: avatar, name and @username (tap for their profile), a Follow
button, and an optional note such as "Followed by 2 people you follow" */
const PersonRow = ({ person, note }) => {
  const { user } = useAuth();
  return (
    <Pressable onPress={() => openProfile(person.username)} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.panel2 }]}>
      <Avatar user={person} size={44} />
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={styles.muted} numberOfLines={1}>
          @{person.username}
        </Text>
        {note ? <Text style={styles.note}>{note}</Text> : null}
      </View>
      {person.id !== user?.id && <FollowButton person={person} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 10, borderRadius: 14 },
  text: { flex: 1, gap: 1 },
  name: { color: colors.fg, fontSize: 15, fontWeight: "600" },
  muted: { color: colors.muted, fontSize: 13 },
  note: { color: colors.brandSoft, fontSize: 12, marginTop: 2 },
});

export default PersonRow;
