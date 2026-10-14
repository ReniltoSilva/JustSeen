import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { colors } from "../lib/theme";

const siteUrl = "https://justseenapp.com";

/* Email and password log in. Creating an account and Google come in the next steps;
until then "Create a free account" opens the website */
export default function Login() {
  const { session, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (session) return <Redirect href="/" />;

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  const ready = email && password;

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>JustSeen</Text>
          <Text style={styles.headline}>
            Movies are better{"\n"}
            <Text style={{ color: colors.brandSoft }}>with friends.</Text>
          </Text>
          <Text style={styles.lead}>Log in to see what your friends have been watching.</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={submit}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              disabled={busy || !ready}
              style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.8 }, !ready && { opacity: 0.5 }]}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
            </Pressable>

            <Pressable onPress={() => Linking.openURL(`${siteUrl}/?mode=signup`)} style={styles.linkButton}>
              <Text style={styles.link}>
                New to JustSeen? <Text style={styles.linkStrong}>Create a free account</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 24, paddingTop: 40, gap: 6 },
  brand: { color: colors.fg, fontSize: 22, fontWeight: "800", marginBottom: 32 },
  headline: { color: colors.fg, fontSize: 36, fontWeight: "800", lineHeight: 40 },
  lead: { color: colors.soft, fontSize: 16, lineHeight: 23, marginTop: 10 },
  form: { marginTop: 32, gap: 8 },
  label: { color: colors.fg, fontSize: 14, fontWeight: "500", marginTop: 8 },
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
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  linkButton: { paddingVertical: 14, alignItems: "center" },
  link: { color: colors.soft, fontSize: 14 },
  linkStrong: { color: colors.brandSoft, fontWeight: "600" },
});
