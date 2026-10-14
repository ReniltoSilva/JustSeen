import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import AvatarPicker from "../components/AvatarPicker";
import { colors } from "../lib/theme";

/* Shown once, after someone's first Google sign-in. The database already gave them a
username from their name, so everything is filled in; they just confirm or change it */
export default function Welcome() {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!user) return <Redirect href="/login" />;
  if (!user.needs_setup) return <Redirect href="/" />;

  const save = async () => {
    setError("");
    setSaving(true);
    try {
      /* Once needs_setup is false, the tabs open instead of this screen */
      await updateProfile({ name, username, avatar, needs_setup: false });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Welcome to JustSeen</Text>
          <Text style={styles.lead}>Choose how your friends will see you. You can change this later.</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} autoComplete="name" />

          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            maxLength={21}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>Friends find you with this. Letters, numbers, dots and underscores.</Text>

          <Text style={styles.label}>Pick an avatar</Text>
          <AvatarPicker value={avatar} onChange={setAvatar} size={40} />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable onPress={save} disabled={saving} style={({ pressed }) => [styles.button, (pressed || saving) && { opacity: 0.8 }]}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Start using JustSeen</Text>}
          </Pressable>
          <Pressable onPress={logout} style={styles.linkButton}>
            <Text style={styles.link}>Not you? Log out</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 24, paddingTop: 40, paddingBottom: 48, gap: 8 },
  title: { color: colors.fg, fontSize: 30, fontWeight: "800" },
  lead: { color: colors.soft, fontSize: 16, lineHeight: 23, marginBottom: 12 },
  label: { color: colors.fg, fontSize: 14, fontWeight: "500", marginTop: 8 },
  hint: { color: colors.muted, fontSize: 12 },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.panel,
    color: colors.fg,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  error: { color: colors.disagree, fontSize: 14, marginTop: 8 },
  button: { height: 48, borderRadius: 12, backgroundColor: colors.brand, alignItems: "center", justifyContent: "center", marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  linkButton: { paddingVertical: 14, alignItems: "center" },
  link: { color: colors.soft, fontSize: 14 },
});
