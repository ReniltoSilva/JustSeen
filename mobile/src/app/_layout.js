import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../auth/AuthContext";
import { colors } from "../lib/theme";

/* Every screen sits inside this: the login state, a dark background, light status bar text */
export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }} />
    </AuthProvider>
  );
}
