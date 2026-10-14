import { ActivityIndicator, View } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../auth/AuthContext";
import { useNotifications } from "../../notifications/NotificationsContext";
import { colors } from "../../lib/theme";

/* A tab's icon: filled when it's the open tab, outlined otherwise */
const tabIcon =
  (name) =>
  ({ color, focused, size }) => <Ionicons name={focused ? name : `${name}-outline`} size={size} color={color} />;

/* The main app, behind the login: Feed, Search, Watchlist, Activity and Profile along the bottom */
export default function TabsLayout() {
  const { session, user, loading } = useAuth();
  const { unread } = useNotifications();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.ink }}>
        <ActivityIndicator color={colors.brand} />
      </View>
    );
  }
  /* No profile means it couldn't load (e.g. no connection); the screens need it */
  if (!session || !user) return <Redirect href="/login" />;
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
        sceneStyle: { backgroundColor: colors.ink },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Feed", tabBarIcon: tabIcon("home") }} />
      <Tabs.Screen name="search" options={{ title: "Search", tabBarIcon: tabIcon("search") }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist", tabBarIcon: tabIcon("bookmark") }} />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: tabIcon("notifications"),
          tabBarBadge: unread > 0 ? (unread > 9 ? "9+" : unread) : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.disagree, color: "#fff", fontSize: 11 },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("person") }} />
    </Tabs>
  );
}
