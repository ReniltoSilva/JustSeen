import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../auth/AuthContext";
import { LibraryProvider } from "../library/LibraryContext";
import { colors } from "../lib/theme";

/* If the app reopens straight on another screen (a reload, a link), the tabs still
load underneath it, so there's always somewhere to go back to */
export const unstable_settings = {
  anchor: "(tabs)",
};

/* Every screen sits inside this: the login state, my reviews, a dark background,
light status bar text. The review screen slides up over the others */
export default function RootLayout() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }}>
          <Stack.Screen name="review/[movieId]" options={{ presentation: "modal" }} />
        </Stack>
      </LibraryProvider>
    </AuthProvider>
  );
}
