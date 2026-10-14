import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import AvatarPicker from "../components/AvatarPicker";
import { closeSheet as close } from "../lib/navigation";
import { colors } from "../lib/theme";

/* Change my name, username, bio, location and avatar, or delete my account */
export default function EditProfile() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  /* Deleting needs two steps: open the warning, then type my username */
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [typedUsername, setTypedUsername] = useState("");

  if (!user) return null;

  const save = async () => {
    setError("");
    setBusy(true);
    try {
      await updateProfile({ name, username, bio, location, avatar });
      close();
    } catch (err) {
      setError(err.message || "Couldn't save. Please try again.");
      setBusy(false);
    }
  };

  const usernameMatches = typedUsername.trim().replace(/^@+/, "").toLowerCase() === user.username;

  const remove = async () => {
    if (!usernameMatches) return;
    setError("");
    setBusy(true);
    try {
      await deleteAccount();
      /* The restore screen takes over from here, with the deletion date */
      router.replace("/");
    } catch (err) {
      setError(err.message || "Couldn't delete your account. Please try again.");
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={Platform.OS === "android" ? ["top", "bottom"] : ["bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.topBar}>
          <Pressable onPress={close} hitSlop={12} accessibilityLabel="Close">
            <Ionicons name="close" size={26} color={colors.soft} />
          </Pressable>
          <Text style={styles.topTitle}>Edit profile</Text>
          <Pressable onPress={save} disabled={busy} hitSlop={12}>
            {busy ? <ActivityIndicator color={colors.brand} /> : <Text style={styles.saveText}>Save</Text>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Avatar</Text>
          <AvatarPicker value={avatar} onChange={setAvatar} size={40} />

          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={40} />

          <Text style={styles.label}>Username</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} maxLength={21} autoCapitalize="none" autoCorrect={false} />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.bio]}
            value={bio}
            onChangeText={setBio}
            maxLength={80}
            multiline
            textAlignVertical="top"
            placeholder="A line about your taste in movies"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            maxLength={40}
            placeholder="e.g. Dublin"
            placeholderTextColor={colors.muted}
          />

          <Text style={styles.label}>Email</Text>
          <Text style={styles.email}>{user.email}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {confirmingDelete ? (
            <View style={styles.danger}>
              <Text style={styles.dangerTitle}>Delete your account?</Text>
              <Text style={styles.dangerText}>
                Your profile, reviews, watchlist, follows and reactions will be hidden straight away and deleted for good
                after 30 days. Changed your mind? Log back in before then to restore everything. We'll email you to confirm.
              </Text>
              <Text style={styles.dangerText}>
                Type your username, <Text style={{ color: colors.fg, fontWeight: "700" }}>{user.username}</Text>, to confirm.
              </Text>
              <TextInput
                style={styles.input}
                value={typedUsername}
                onChangeText={setTypedUsername}
                placeholder={user.username}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <View style={styles.dangerButtons}>
                <Pressable
                  onPress={() => {
                    setConfirmingDelete(false);
                    setTypedUsername("");
                  }}
                  style={[styles.dangerButton, styles.keepButton]}
                >
                  <Text style={styles.keepText}>Keep my account</Text>
                </Pressable>
                <Pressable
                  onPress={remove}
                  disabled={!usernameMatches || busy}
                  style={[styles.dangerButton, styles.deleteButton, (!usernameMatches || busy) && { opacity: 0.4 }]}
                >
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.deleteButtonText}>Delete account</Text>}
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable onPress={() => setConfirmingDelete(true)} disabled={busy} style={styles.delete}>
              <Text style={styles.deleteText}>Delete account</Text>
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.panel },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  topTitle: { color: colors.fg, fontSize: 16, fontWeight: "700" },
  saveText: { color: colors.brandSoft, fontSize: 16, fontWeight: "700" },
  content: { padding: 20, paddingBottom: 48, gap: 8 },
  label: { color: colors.muted, fontSize: 12, fontWeight: "700", letterSpacing: 1, textTransform: "uppercase", marginTop: 12 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.ink,
    color: colors.fg,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  bio: { minHeight: 90, paddingTop: 12 },
  email: { color: colors.soft, fontSize: 15 },
  error: { color: colors.disagree, fontSize: 14, marginTop: 8 },
  delete: { marginTop: 32, alignItems: "center", padding: 12 },
  deleteText: { color: colors.disagree, fontSize: 15, fontWeight: "600" },
  danger: {
    marginTop: 32,
    padding: 16,
    gap: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(251,113,133,0.3)",
    backgroundColor: "rgba(251,113,133,0.08)",
  },
  dangerTitle: { color: colors.fg, fontSize: 16, fontWeight: "700" },
  dangerText: { color: colors.soft, fontSize: 14, lineHeight: 20 },
  dangerButtons: { flexDirection: "row", gap: 10, marginTop: 4 },
  dangerButton: { flex: 1, height: 44, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  keepButton: { backgroundColor: colors.panel2 },
  keepText: { color: colors.fg, fontSize: 14, fontWeight: "600" },
  deleteButton: { backgroundColor: colors.disagree },
  deleteButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
