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
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import AvatarPicker from "../components/AvatarPicker";
import PasswordChecklist from "../components/PasswordChecklist";
import Logo from "../components/Logo";
import { colors } from "../lib/theme";
import { siteUrl } from "../lib/site";
import { animalAvatars, animalValue } from "../../../shared/avatars";

/* The same words as the website's login page (client/src/pages/Login.jsx) */
const copy = {
  login: { title: "Welcome back", subtitle: "Log in to see what your friends have been watching." },
  signup: { title: "Join your friends on JustSeen", subtitle: "Free, simple, and takes less than a minute." },
  forgot: { title: "Reset your password", subtitle: "Enter your email and we'll send you a link." },
};

/* What makes JustSeen different, in three lines */
const promises = [
  { emoji: "✍️", title: "Share what you watched", text: "A star rating and a few honest words. That's a review." },
  { emoji: "👀", title: "See what friends are watching", text: "Your feed is the people you follow, not a database." },
  { emoji: "🍿", title: "Pick what to watch next", text: "Trust friends' taste over critic scores." },
];

/* Log in, create an account, or reset a forgotten password, plus Google */
export default function Login() {
  const { session, user, login, signup, signInWithGoogle, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(() => animalValue(animalAvatars[Math.floor(Math.random() * animalAvatars.length)]));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  if (session && user) return <Redirect href="/" />;

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  /* Runs one of the actions with the spinner and error message handled */
  const run = async (action) => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submit = () =>
    run(async () => {
      if (mode === "login") {
        await login(email, password);
      } else if (mode === "signup") {
        const needsConfirming = await signup({ email, password, name, username, avatar });
        if (needsConfirming) {
          setMode("login");
          setPassword("");
          setNotice(`Almost there! We sent a link to ${email.trim()}. Open it to confirm your email, then log in here.`);
        }
      } else {
        await sendPasswordReset(email);
        setNotice("Check your email for a link to choose a new password. Then come back and log in.");
        setMode("login");
      }
    });

  const ready =
    mode === "login" ? email && password : mode === "signup" ? email && password && name && username : email;

  const buttonLabel = { login: "Log in", signup: "Create free account", forgot: "Send reset link" }[mode];

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <Logo />
          </View>
          {mode !== "forgot" && (
            <>
              <View style={styles.free}>
                <Ionicons name="checkmark" size={13} color="#6ee7b7" />
                <Text style={styles.freeText}>100% free, for everyone</Text>
              </View>
              <Text style={styles.headline}>
                Movies are better{"\n"}
                <Text style={{ color: colors.brandSoft }}>with friends.</Text>
              </Text>
              <Text style={styles.lead}>
                Share quick reviews of what you watch, and decide what to see next from the people whose taste you trust.
                No critic scores. Just your friends.
              </Text>
              <View style={styles.promises}>
                {promises.map((item) => (
                  <View key={item.title} style={styles.promise}>
                    <Text style={styles.promiseEmoji}>{item.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.promiseTitle}>{item.title}</Text>
                      <Text style={styles.promiseText}>{item.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          <Text style={styles.formTitle}>{copy[mode].title}</Text>
          <Text style={styles.formSubtitle}>{copy[mode].subtitle}</Text>

          {mode !== "forgot" && (
            <>
              <Pressable
                onPress={() => run(signInWithGoogle)}
                disabled={busy}
                style={({ pressed }) => [styles.google, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="logo-google" size={18} color="#1f1f1f" />
                <Text style={styles.googleText}>Continue with Google</Text>
              </Pressable>
              <View style={styles.or}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>or with email</Text>
                <View style={styles.orLine} />
              </View>
            </>
          )}

          <View style={styles.form}>
            {mode === "signup" && (
              <>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor={colors.muted}
                  autoComplete="name"
                  textContentType="name"
                  maxLength={40}
                />
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="e.g. alex.movies"
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username-new"
                  textContentType="username"
                  maxLength={21}
                />
                <Text style={styles.hint}>Friends find you with this. Letters, numbers, dots and underscores.</Text>
              </>
            )}

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

            {mode !== "forgot" && (
              <>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Password</Text>
                  {mode === "login" && (
                    <Pressable onPress={() => switchMode("forgot")} hitSlop={8}>
                      <Text style={styles.forgot}>Forgot password?</Text>
                    </Pressable>
                  )}
                </View>
                {/* The eye shows or hides what I typed, like the website's PasswordInput */}
                <View>
                  <TextInput
                    style={[styles.input, { paddingRight: 52 }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    textContentType={mode === "signup" ? "newPassword" : "password"}
                    onSubmitEditing={mode === "login" ? submit : undefined}
                  />
                  <Pressable
                    onPress={() => setShowPassword((shown) => !shown)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                    style={styles.eye}
                  >
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={21} color={colors.muted} />
                  </Pressable>
                </View>
                {mode === "signup" && <PasswordChecklist password={password} />}
              </>
            )}

            {mode === "signup" && (
              <>
                <Text style={styles.label}>Pick an avatar</Text>
                <AvatarPicker value={avatar} onChange={setAvatar} size={40} />
              </>
            )}

            {notice ? <Text style={styles.notice}>{notice}</Text> : null}
            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              onPress={submit}
              disabled={busy || !ready}
              style={({ pressed }) => [styles.button, (pressed || busy) && { opacity: 0.8 }, !ready && { opacity: 0.5 }]}
            >
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{buttonLabel}</Text>}
            </Pressable>

            {mode === "signup" && (
              <Text style={styles.small}>
                By creating an account you agree to our{" "}
                <Text style={styles.linkStrong} onPress={() => Linking.openURL(`${siteUrl}/privacy`)}>
                  privacy policy
                </Text>
                .
              </Text>
            )}

            <Pressable onPress={() => switchMode(mode === "login" ? "signup" : "login")} style={styles.linkButton}>
              <Text style={styles.link}>
                {mode === "login" ? "New to JustSeen? " : "Already have an account? "}
                <Text style={styles.linkStrong}>{mode === "login" ? "Create a free account" : "Log in"}</Text>
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
  content: { padding: 24, paddingTop: 40, paddingBottom: 48, gap: 6 },
  brand: { marginBottom: 28 },
  free: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(52,211,153,0.25)",
    backgroundColor: "rgba(52,211,153,0.1)",
  },
  freeText: { color: "#6ee7b7", fontSize: 12, fontWeight: "700" },
  headline: { color: colors.fg, fontSize: 38, fontWeight: "800", lineHeight: 42, letterSpacing: -0.5 },
  lead: { color: colors.soft, fontSize: 16, lineHeight: 24, marginTop: 12 },
  promises: { gap: 14, marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: colors.line },
  promise: { flexDirection: "row", gap: 12 },
  promiseEmoji: { fontSize: 20 },
  promiseTitle: { color: colors.fg, fontSize: 14, fontWeight: "700" },
  promiseText: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  formTitle: { color: colors.fg, fontSize: 24, fontWeight: "800", marginTop: 32 },
  formSubtitle: { color: colors.muted, fontSize: 15, marginBottom: 4 },
  google: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 28,
  },
  googleText: { color: "#1f1f1f", fontSize: 15, fontWeight: "600" },
  or: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 18 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.line },
  orText: { color: colors.muted, fontSize: 13 },
  form: { marginTop: 12, gap: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  label: { color: colors.fg, fontSize: 14, fontWeight: "500", marginTop: 8 },
  forgot: { color: colors.brandSoft, fontSize: 13, fontWeight: "600" },
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
  eye: { position: "absolute", right: 0, top: 0, bottom: 0, width: 48, alignItems: "center", justifyContent: "center" },
  notice: {
    color: colors.agree,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "rgba(52,211,153,0.1)",
    overflow: "hidden",
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
  small: { color: colors.muted, fontSize: 12, textAlign: "center", marginTop: 4 },
  linkButton: { paddingVertical: 14, alignItems: "center" },
  link: { color: colors.soft, fontSize: 14 },
  linkStrong: { color: colors.brandSoft, fontWeight: "600" },
});
