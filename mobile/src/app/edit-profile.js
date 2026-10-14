import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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

  /* Asked twice, since it can't be undone */
  const confirmDelete = () =>
    Alert.alert(
      "Delete your account?",
      "Your profile, reviews, watchlist, follows and reactions will be deleted for good. This can't be undone.",
      [
        { text: "Keep my account", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            Alert.alert("Are you sure?", `Deleting @${user.username} now.`, [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete for good",
                style: "destructive",
                onPress: async () => {
                  setBusy(true);
                  try {
                    await deleteAccount();
                    router.replace("/login");
                  } catch (err) {
                    setError(err.message || "Couldn't delete your account. Please try again.");
                    setBusy(false);
                  }
                },
              },
            ]),
        },
      ],
    );

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

          <Pressable onPress={confirmDelete} disabled={busy} style={styles.delete}>
            <Text style={styles.deleteText}>Delete account</Text>
          </Pressable>
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
});
