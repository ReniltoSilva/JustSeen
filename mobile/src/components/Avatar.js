import { StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { avatarFor } from "../../../shared/avatars";

/* The same avatars as the website: an animal on its gradient, or a photo */
const Avatar = ({ user, size = 36 }) => {
  const avatar = avatarFor(user);
  const round = { width: size, height: size, borderRadius: size / 2 };

  if (avatar.type === "photo") return <Image source={avatar.src} style={round} />;

  return (
    <LinearGradient
      colors={[avatar.animal.from, avatar.animal.to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[round, styles.center]}
    >
      <Text style={{ fontSize: size * 0.6 }}>{avatar.animal.emoji}</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});

export default Avatar;

/* A small wrapper so avatars can sit in a row overlapping each other */
export const AvatarRing = ({ children, color }) => (
  <View style={{ borderRadius: 999, borderWidth: 2, borderColor: color }}>{children}</View>
);
