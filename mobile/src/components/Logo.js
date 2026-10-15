import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Path } from "react-native-svg";
import { colors } from "../lib/theme";

/* The JustSeen mark and name, the same shapes as the website's Logo.jsx and favicon */
export const LogoMark = ({ height = 24 }) => (
  <Svg width={(height * 382) / 250} height={height} viewBox="118 70 382 250">
    <G fill="#4f3fe0">
      <Circle cx="187" cy="212" r="64" />
      <Path d="M140 175 C 150 125, 190 92, 230 76 L 240 86 C 214 104, 200 126, 198 150 Z" />
    </G>
    <Path
      d="M246 120 L 466 103 Q 482 102 482 118 L 482 284 Q 482 300 466 299 L 236 282"
      fill="none"
      stroke="#4f3fe0"
      strokeWidth="30"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </Svg>
);

const Logo = () => (
  <View style={styles.logo} accessibilityRole="header" accessibilityLabel="JustSeen">
    <LogoMark />
    <Text style={styles.name}>JustSeen</Text>
  </View>
);

const styles = StyleSheet.create({
  logo: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { color: colors.fg, fontSize: 20, fontWeight: "800", letterSpacing: -0.3 },
});

export default Logo;
