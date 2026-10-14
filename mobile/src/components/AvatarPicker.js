import { Pressable, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { animalAvatars, animalValue } from "../../../shared/avatars";
import { colors } from "../lib/theme";

/* Grid of the free animal avatars; the value is "animal:fox" style, like the website */
const AvatarPicker = ({ value, onChange, size = 44 }) => (
  <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Choose an avatar">
    {animalAvatars.map((animal) => {
      const selected = value === animalValue(animal);
      return (
        <Pressable
          key={animal.id}
          onPress={() => onChange(animalValue(animal))}
          accessibilityRole="radio"
          accessibilityState={{ checked: selected }}
          accessibilityLabel={animal.id}
          style={[styles.ring, selected && styles.ringSelected, { borderRadius: size }]}
        >
          <LinearGradient
            colors={[animal.from, animal.to]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, opacity: selected || !value ? 1 : 0.75 }]}
          >
            <Text style={{ fontSize: size * 0.6 }}>{animal.emoji}</Text>
          </LinearGradient>
        </Pressable>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  ring: { padding: 2, borderWidth: 2, borderColor: "transparent" },
  ringSelected: { borderColor: colors.brand },
  avatar: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});

export default AvatarPicker;
