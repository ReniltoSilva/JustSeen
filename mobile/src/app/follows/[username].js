import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { getFollowers, getFollowing, getProfileByUsername } from "../../data/people";
import PersonRow from "../../components/PersonRow";
import { colors } from "../../lib/theme";

/* Someone's followers, or the people they follow (/follows/<username>?list=followers) */
export default function FollowsScreen() {
  const { username, list: startList } = useLocalSearchParams();
  const [list, setList] = useState(startList === "following" ? "following" : "followers");
  const [people, setPeople] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setPeople(null);
    setFailed(false);
    getProfileByUsername(username)
      .then((person) => {
        if (!person) throw new Error("No such person");
        return list === "followers" ? getFollowers(person.id) : getFollowing(person.id);
      })
      .then((found) => !cancelled && setPeople(found))
      .catch((error) => {
        console.error("Failed to load people:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [username, list]);

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen options={{ title: `@${username}` }} />
      <View style={styles.switcher}>
        {[
          { key: "followers", label: "Followers" },
          { key: "following", label: "Following" },
        ].map((option) => (
          <Pressable key={option.key} onPress={() => setList(option.key)} style={[styles.option, list === option.key && styles.optionActive]}>
            <Text style={[styles.optionText, list === option.key && { color: colors.fg }]}>{option.label}</Text>
          </Pressable>
        ))}
      </View>

      {people === null ? (
        failed ? (
          <Text style={styles.message}>Couldn't load this list. Check your connection.</Text>
        ) : (
          <ActivityIndicator color={colors.brand} style={{ marginTop: 32 }} />
        )
      ) : (
        <FlatList
          data={people}
          keyExtractor={(person) => person.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <PersonRow person={item} />}
          ListEmptyComponent={
            <Text style={styles.message}>{list === "followers" ? "No followers yet." : "Not following anyone yet."}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: { flexDirection: "row", margin: 16, marginBottom: 8, padding: 4, borderRadius: 999, backgroundColor: colors.panel2 },
  option: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 999 },
  optionActive: { backgroundColor: colors.panel },
  optionText: { color: colors.muted, fontSize: 14, fontWeight: "600" },
  list: { padding: 8, paddingBottom: 32 },
  message: { color: colors.muted, fontSize: 15, textAlign: "center", padding: 32 },
});
