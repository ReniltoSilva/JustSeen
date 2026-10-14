import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../lib/theme";

/* Movie search and writing reviews arrive in the next step */
export default function Search() {
  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>🔎</Text>
      <Text style={styles.title}>Search is coming next</Text>
      <Text style={styles.text}>Finding movies and writing reviews is the next part of the app we build.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 8 },
  emoji: { fontSize: 48 },
  title: { color: colors.fg, fontSize: 20, fontWeight: "700" },
  text: { color: colors.soft, fontSize: 15, textAlign: "center", lineHeight: 22 },
});
