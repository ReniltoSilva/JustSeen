import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../auth/AuthContext";
import Avatar from "../../components/Avatar";
import { colors } from "../../lib/theme";

/* For now: who's logged in, and a way out. The full profile comes later */
export default function Profile() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.screen}>
      <Avatar user={user} size={88} />
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.username}>@{user?.username}</Text>
      {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}

      <Pressable onPress={logout} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]}>
        <Text style={styles.logoutText}>Log out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", paddingTop: 48, paddingHorizontal: 24, gap: 6 },
  name: { color: colors.fg, fontSize: 22, fontWeight: "800", marginTop: 12 },
  username: { color: colors.muted, fontSize: 15 },
  bio: { color: colors.soft, fontSize: 15, textAlign: "center", marginTop: 8 },
  logout: {
    marginTop: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  logoutText: { color: colors.disagree, fontSize: 15, fontWeight: "600" },
});
