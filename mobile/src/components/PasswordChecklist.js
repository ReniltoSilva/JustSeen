import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { passwordRules } from "../../../shared/passwords";
import { colors } from "../lib/theme";

/* The password rules, ticked off as they're met while typing */
const PasswordChecklist = ({ password }) => (
  <View style={styles.list}>
    {passwordRules.map((rule) => {
      const met = rule.test(password);
      return (
        <View key={rule.id} style={styles.rule}>
          <Ionicons name={met ? "checkmark-circle" : "ellipse-outline"} size={14} color={met ? colors.agree : colors.muted} />
          <Text style={[styles.text, met && { color: colors.soft }]}>{rule.label}</Text>
        </View>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  list: { gap: 4, marginTop: 4 },
  rule: { flexDirection: "row", alignItems: "center", gap: 6 },
  text: { color: colors.muted, fontSize: 13 },
});

export default PasswordChecklist;
