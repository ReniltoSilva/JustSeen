import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../lib/theme";

/* Five stars, in half steps like the website: tapping the left half of a star
gives x.5, the right half a whole star */
const StarPicker = ({ value, onChange, size = 40 }) => (
  <View style={styles.row} accessibilityRole="adjustable" accessibilityLabel={`Rating: ${value || "none"} out of 5`}>
    {[1, 2, 3, 4, 5].map((star) => {
      const icon = value >= star ? "star" : value >= star - 0.5 ? "star-half" : "star-outline";
      return (
        <View key={star} style={{ width: size, height: size }}>
          <Ionicons name={icon} size={size} color={value >= star - 0.5 ? colors.star : colors.lineStrong} />
          <View style={[StyleSheet.absoluteFill, styles.halves]}>
            <Pressable style={styles.half} onPress={() => onChange(star - 0.5)} accessibilityLabel={`${star - 0.5} stars`} />
            <Pressable style={styles.half} onPress={() => onChange(star)} accessibilityLabel={`${star} stars`} />
          </View>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 4 },
  halves: { flexDirection: "row" },
  half: { flex: 1 },
});

export default StarPicker;
