import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotifications } from "../notifications/NotificationsContext";
import { colors } from "../lib/theme";

/* The bell in the top-right corner, like the website's header: opens Activity, with a
red badge for notifications I haven't seen yet */
const ActivityBell = () => {
  const { unread } = useNotifications();
  return (
    <Pressable
      onPress={() => router.push("/activity")}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={unread ? `Activity, ${unread} new` : "Activity"}
      style={({ pressed }) => [styles.bell, pressed && { opacity: 0.6 }]}
    >
      <Ionicons name="notifications-outline" size={23} color={colors.fg} />
      {unread > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unread > 9 ? "9+" : unread}</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bell: { marginRight: 16, padding: 4 },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.disagree,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.ink,
  },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
});

export default ActivityBell;
