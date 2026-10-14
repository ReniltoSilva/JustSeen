import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../auth/AuthContext";
import { getProfileByUsername } from "../../data/people";
import ProfileView from "../../components/ProfileView";
import { colors } from "../../lib/theme";

/* Someone's profile, opened by tapping their name anywhere (/u/<username>) */
export default function PersonScreen() {
  const { username } = useLocalSearchParams();
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "missing" | "error"

  useEffect(() => {
    let cancelled = false;
    getProfileByUsername(username)
      .then((found) => {
        if (cancelled) return;
        setPerson(found);
        setStatus(found ? "ready" : "missing");
      })
      .catch((error) => {
        console.error("Failed to load profile:", error);
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  return (
    <>
      <Stack.Screen options={{ title: `@${username}` }} />
      {status === "ready" ? (
        <ProfileView person={person} isMe={person.id === user.id} />
      ) : (
        <View style={styles.center}>
          {status === "loading" ? (
            <ActivityIndicator color={colors.brand} />
          ) : (
            <Text style={styles.message}>
              {status === "missing" ? `There's nobody called @${username}.` : "Couldn't load this profile. Check your connection."}
            </Text>
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  message: { color: colors.muted, fontSize: 15, textAlign: "center" },
});
