import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import ProfileView from "../../components/ProfileView";
import { contactEmail, siteUrl } from "../../lib/site";
import { colors } from "../../lib/theme";

/* A feedback email with the details that help fix a bug, like the website's */
const feedbackLink = (user) => {
  const details = [
    "",
    "",
    "---",
    `Account: @${user.username}`,
    `App: JustSeen ${Constants.expoConfig?.version ?? ""} on ${Platform.OS} ${Platform.Version}`,
  ].join("\n");
  return `mailto:${contactEmail}?subject=${encodeURIComponent("JustSeen app feedback")}&body=${encodeURIComponent(details)}`;
};

/* My own profile, with feedback, privacy and log out at the bottom */
export default function Profile() {
  const { user, logout } = useAuth();
  /* For the moment between logging out and leaving the tabs */
  if (!user) return null;

  const links = [
    { icon: "chatbubble-ellipses-outline", label: "Send feedback or report a bug", onPress: () => Linking.openURL(feedbackLink(user)) },
    { icon: "shield-checkmark-outline", label: "Privacy policy", onPress: () => Linking.openURL(`${siteUrl}/privacy`) },
    { icon: "log-out-outline", label: "Log out", onPress: logout, danger: true },
  ];

  return (
    <ProfileView
      person={user}
      isMe
      footer={
        <View style={styles.footer}>
          {links.map((link) => (
            <Pressable key={link.label} onPress={link.onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.panel2 }]}>
              <Ionicons name={link.icon} size={19} color={link.danger ? colors.disagree : colors.soft} />
              <Text style={[styles.rowText, link.danger && { color: colors.disagree }]}>{link.label}</Text>
            </Pressable>
          ))}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: 24, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  rowText: { color: colors.fg, fontSize: 15 },
});
