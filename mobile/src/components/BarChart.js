import { StyleSheet, Text, View } from "react-native";
import { colors } from "../lib/theme";

/* Simple vertical bars with a label under each and the count above; data is
[{ label, value }] like the website's BarChart */
const BarChart = ({ data, height = 110 }) => {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <View style={styles.chart}>
      {data.map((item) => (
        <View key={item.label} style={styles.column}>
          <View style={[styles.track, { height }]}>
            {item.value > 0 && <Text style={styles.value}>{item.value}</Text>}
            <View style={[styles.bar, { height: Math.max(item.value ? 4 : 2, (item.value / max) * (height - 16)) }, !item.value && styles.empty]} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  chart: { flexDirection: "row", gap: 4 },
  column: { flex: 1, alignItems: "center", gap: 4 },
  track: { width: "100%", justifyContent: "flex-end", alignItems: "center" },
  value: { color: colors.muted, fontSize: 9, marginBottom: 2 },
  bar: { width: "80%", borderRadius: 4, backgroundColor: colors.brand },
  empty: { backgroundColor: colors.line },
  label: { color: colors.muted, fontSize: 9 },
});

export default BarChart;
