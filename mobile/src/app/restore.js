import { useState } from "react";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { contactEmail } from "../lib/site";
import { colors } from "../lib/theme";

/* "November 13, 2026": the day the account is deleted for good, 30 days after asking */
const deletionDay = (requestedAt) =>
  new Date(Date.parse(requestedAt) + 30 * 86_400_000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/* Shown instead of the app while an account waits to be deleted: right after asking,
and whenever the person logs in during the 30 days (same as the website) */
export default function Restore() {
  const { user, restoreAccount, logout } = useAuth();
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const [openedAt] = useState(() => Date.now());

  if (!user) return <Redirect href="/login" />;
  if (!user.deletion_requested_at) return <Redirect href="/" />;

  const day = deletionDay(user.deletion_requested_at);
  /* Asked in the last few minutes: this is the confirmation, not a return visit */
  const justAsked = openedAt - Date.parse(user.deletion_requested_at) < 5 * 60_000;

  const restore = async () => {
    setError("");
    setRestoring(true);
    try {
      await restoreAccount();
    } catch (err) {
      setError(err.message || "Couldn't restore your account. Please try again.");
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>JustSeen</Text>
        <Text style={styles.title}>{justAsked ? "Your account will be deleted" : "Welcome back"}</Text>
        <Text style={styles.text}>
          {justAsked ? "Your account is now hidden from everyone." : `@${user.username} is scheduled for deletion.`} It will be
          deleted for good on <Text style={styles.strong}>{day}</Text>, together with your reviews, watchlist, follows and
          reactions.
        </Text>
        <Text style={styles.text}>
          {justAsked
            ? `We've emailed you a confirmation. Changed your mind? Log in any time before ${day} and restore it.`
            : "Changed your mind? Restore it and everything will be just as you left it."}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable onPress={restore} disabled={restoring} style={({ pressed }) => [styles.primary, (pressed || restoring) && { opacity: 0.8 }]}>
          {restoring ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Restore my account</Text>}
        </Pressable>
        <Pressable onPress={logout} style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}>
          <Text style={styles.secondaryText}>Log out</Text>
        </Pressable>

        <Text style={styles.small}>
          Questions about your data? Write to{" "}
          <Text style={styles.link} onPress={() => Linking.openURL(`mailto:${contactEmail}`)}>
            {contactEmail}
          </Text>
          .
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 24, paddingTop: 48, gap: 14 },
  brand: { color: colors.fg, fontSize: 22, fontWeight: "800", marginBottom: 20 },
  title: { color: colors.fg, fontSize: 30, fontWeight: "800" },
  text: { color: colors.soft, fontSize: 16, lineHeight: 24 },
  strong: { color: colors.fg, fontWeight: "700" },
  error: { color: colors.disagree, fontSize: 14 },
  primary: { height: 50, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginTop: 12 },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondary: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: colors.lineStrong, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.fg, fontSize: 16, fontWeight: "600" },
  small: { color: colors.muted, fontSize: 12, marginTop: 12 },
  link: { color: colors.brandSoft },
});
