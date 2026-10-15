import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import ActivityBell from "../../components/ActivityBell";
import Logo from "../../components/Logo";
import { colors } from "../../lib/theme";

/* A tab's icon: filled when it's the open tab, outlined otherwise */
const tabIcon =
  (name) =>
  ({ color, focused, size }) => <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;

/* The main app, behind the login: Feed, Search, Watched, Watchlist and Profile along the
bottom, and the Activity bell in the top-right corner of each */
export default function TabsLayout() {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  /* No profile means it couldn't load (e.g. no connection); the screens need it */
  if (!session || !user) return <Redirect href="/login" />;
  /* Deleting the account: until the 30 days are up, offer to restore it */
  if (user.deletion_requested_at) return <Redirect href="/restore" />;
  /* New Google accounts pick their name and username first */
  if (user.needs_setup) return <Redirect href="/welcome" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.ink },
        headerTintColor: colors.fg,
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        tabBarStyle: { backgroundColor: colors.ink, borderTopColor: colors.line },
        tabBarActiveTintColor: colors.brandSoft,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        headerRight: () => <ActivityBell />,
        sceneStyle: { backgroundColor: colors.ink },
      }}
    >
      {/* The feed shows the logo, top left, instead of its name */}
      <Tabs.Screen
        name="index"
        options={{ title: "Feed", headerTitle: () => <Logo />, headerTitleAlign: "left", tabBarIcon: tabIcon("home") }}
      />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: tabIcon("search") }} />
      <Tabs.Screen name="watched" options={{ title: "Watched", tabBarIcon: tabIcon("ticket") }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist", tabBarIcon: tabIcon("bookmark") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("person") }} />
    </Tabs>
  );
}
