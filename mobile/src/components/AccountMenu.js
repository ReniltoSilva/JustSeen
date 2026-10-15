import { useState } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { contactEmail, siteUrl } from "../lib/site";
import { colors } from "../lib/theme";
import Avatar from "./Avatar";

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

/* My avatar in the top-right corner, next to the bell, like the website's header.
Tapping it opens a small menu: my profile, edit profile, feedback, privacy and log out */
const AccountMenu = () => {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  if (!user) return null;

  /* Close the menu first, then do the thing */
  const choose = (action) => () => {
    setOpen(false);
    action();
  };

  const items = [
    { icon: "person-outline", label: "Your profile", onPress: () => router.navigate("/profile") },
    { icon: "create-outline", label: "Edit profile", onPress: () => router.push("/edit-profile") },
    { icon: "chatbubble-ellipses-outline", label: "Send feedback or report a bug", onPress: () => Linking.openURL(feedbackLink(user)) },
    { icon: "shield-checkmark-outline", label: "Privacy policy", onPress: () => Linking.openURL(`${siteUrl}/privacy`) },
    { icon: "log-out-outline", label: "Log out", onPress: logout, danger: true },
  ];

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Your account"
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
      >
        <Avatar user={user} size={30} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)} statusBarTranslucent>
        {/* Tapping anywhere outside the menu closes it */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} accessibilityLabel="Close menu">
          <Pressable style={[styles.menu, { top: insets.top + 52 }]} onPress={() => {}}>
            <View style={styles.who}>
              <Avatar user={user} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={styles.username} numberOfLines={1}>
                  @{user.username}
                </Text>
              </View>
            </View>
            {items.map((item) => (
              <Pressable
                key={item.label}
                onPress={choose(item.onPress)}
                style={({ pressed }) => [styles.item, pressed && { backgroundColor: colors.panel2 }]}
              >
                <Ionicons name={item.icon} size={19} color={item.danger ? colors.disagree : colors.soft} />
                <Text style={[styles.itemText, item.danger && { color: colors.disagree }]}>{item.label}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: { marginRight: 16, borderRadius: 999, borderWidth: 2, borderColor: colors.lineStrong },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  menu: {
    position: "absolute",
    right: 12,
    width: 270,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  who: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  name: { color: colors.fg, fontSize: 15, fontWeight: "700" },
  username: { color: colors.muted, fontSize: 13 },
  item: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  itemText: { color: colors.fg, fontSize: 15 },
});

export default AccountMenu;
