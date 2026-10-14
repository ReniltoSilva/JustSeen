import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../auth/AuthContext";
import { LibraryProvider } from "../library/LibraryContext";
import { NotificationsProvider } from "../notifications/NotificationsContext";
import { colors } from "../lib/theme";

/* If the app reopens straight on another screen (a reload, a link), the tabs still
load underneath it, so there's always somewhere to go back to */
export const unstable_settings = {
  anchor: "(tabs)",
};

/* A top bar with a back arrow, for screens opened on top of the tabs */
const withBackBar = {
  headerShown: true,
  headerStyle: { backgroundColor: colors.ink },
  headerTintColor: colors.fg,
  headerTitleStyle: { fontWeight: "700" },
  headerShadowVisible: false,
  headerBackButtonDisplayMode: "minimal",
};

/* Every screen sits inside this: the login state, my library, my notifications, a dark
background, light status bar text */
export default function RootLayout() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <NotificationsProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.ink } }}>
            {/* The first screen listed is where the app starts, so the tabs go first */}
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="login" />
            <Stack.Screen name="welcome" />
            {/* The movie page's backdrop runs up under a see-through top bar */}
            <Stack.Screen
              name="movie/[movieId]"
              options={{ ...withBackBar, title: "", headerTransparent: true, headerStyle: { backgroundColor: "transparent" } }}
            />
            <Stack.Screen name="u/[username]" options={withBackBar} />
            <Stack.Screen name="follows/[username]" options={withBackBar} />
            <Stack.Screen name="year/[username]" options={withBackBar} />
            {/* These slide up over the others */}
            <Stack.Screen name="review/[movieId]" options={{ presentation: "modal" }} />
            <Stack.Screen name="edit-profile" options={{ presentation: "modal" }} />
            <Stack.Screen name="share/[reviewId]" options={{ presentation: "modal" }} />
          </Stack>
        </NotificationsProvider>
      </LibraryProvider>
    </AuthProvider>
  );
}
