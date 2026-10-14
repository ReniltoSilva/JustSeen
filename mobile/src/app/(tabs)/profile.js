import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import ProfileView from "../../components/ProfileView";
import { siteUrl } from "../../lib/site";
import { colors } from "../../lib/theme";

/* My own profile. Editing it happens on the website for now */
export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <ProfileView
      person={user}
      isMe
      footer={
        <View style={styles.footer}>
          <Pressable onPress={() => Linking.openURL(`${siteUrl}/u/${user.username}`)} style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
            <Text style={styles.buttonText}>Edit profile on the website</Text>
          </Pressable>
          <Pressable onPress={logout} style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
            <Text style={[styles.buttonText, { color: colors.disagree }]}>Log out</Text>
          </Pressable>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  footer: { gap: 10, marginTop: 24, alignItems: "center" },
  button: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 24,
    paddingVertical: 10,
    minWidth: 240,
    alignItems: "center",
  },
  buttonText: { color: colors.fg, fontSize: 15, fontWeight: "600" },
});
