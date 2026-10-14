import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Share, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { captureRef } from "react-native-view-shot";
import LinkPreviewCard, { cardHeight, cardWidth } from "../../components/LinkPreviewCard";
import { markShared, reviewLink, shareText, uploadSharePicture } from "../../data/sharing";
import { closeSheet, pendingShare } from "../../lib/navigation";
import { colors } from "../../lib/theme";

/* Share one of my reviews. The card below is photographed and uploaded straight away,
so it's ready by the time WhatsApp or X fetch the link's preview. The link starts
working for other people when I actually share it */
export default function ShareScreen() {
  const { reviewId } = useLocalSearchParams();
  const share = pendingShare(reviewId);
  const { width } = useWindowDimensions();
  const cardRef = useRef(null);
  const upload = useRef(null);
  const [posterReady, setPosterReady] = useState(!share?.movie.poster_path);
  const [uploadFailed, setUploadFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  /* Once the poster has loaded: photograph the card at 1200 x 630 and upload it */
  useEffect(() => {
    if (!share || !posterReady || upload.current) return;
    upload.current = new Promise((resolve) => setTimeout(resolve, 300)) // let the avatar and blur settle
      .then(() => captureRef(cardRef, { format: "jpg", quality: 0.9, width: 1200, height: 630, result: "base64" }))
      .then((base64) => uploadSharePicture(share.author.id, reviewId, base64));
    upload.current.catch((err) => {
      console.error("Failed to upload the link preview:", err);
      setUploadFailed(true);
    });
  }, [share, posterReady, reviewId]);

  if (!share) {
    return (
      <SafeAreaView style={[styles.screen, styles.center]}>
        <Text style={styles.muted}>Open this review again to share it.</Text>
        <Pressable onPress={closeSheet} hitSlop={12}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const link = reviewLink(reviewId);
  const text = shareText(share);

  /* Sharing is what makes the link work for other people. It waits for the upload in
  the background, so the share menu opens straight away */
  const publish = () =>
    upload.current?.then(() => markShared(reviewId)).catch((err) => console.error("Failed to publish the review link:", err));

  const shareReview = async () => {
    setError("");
    publish();
    try {
      /* iPhones show the link as its own preview when it's passed as `url` */
      await Share.share(Platform.OS === "ios" ? { message: text, url: link } : { message: `${text} ${link}` });
    } catch (err) {
      console.error("Sharing failed:", err);
      setError("Sharing didn't work. Copy the link instead.");
    }
  };

  const copyLink = async () => {
    publish();
    await Clipboard.setStringAsync(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* The card is laid out at its real size and shrunk to fit the screen */
  const scale = Math.min(1, (width - 40) / cardWidth);

  return (
    <SafeAreaView style={styles.screen} edges={Platform.OS === "android" ? ["top", "bottom"] : ["bottom"]}>
      <View style={styles.topBar}>
        <Pressable onPress={closeSheet} hitSlop={12} accessibilityLabel="Close">
          <Ionicons name="close" size={26} color={colors.soft} />
        </Pressable>
        <Text style={styles.topTitle}>{share.justSaved ? "Review saved!" : "Share your review"}</Text>
        <View style={{ width: 26 }} />
      </View>

      <View style={styles.content}>
        {share.justSaved && <Text style={styles.lead}>Tell your friends what you thought of {share.movie.title}.</Text>}

        <View style={{ width: cardWidth * scale, height: cardHeight * scale, alignSelf: "center" }}>
          <View style={[styles.cardFrame, { transform: [{ scale }] }]}>
            <LinkPreviewCard ref={cardRef} {...share} onPosterLoad={() => setPosterReady(true)} />
          </View>
        </View>
        <Text style={styles.caption}>This is the preview your friends see with the link.</Text>

        <Pressable onPress={shareReview} style={({ pressed }) => [styles.primary, pressed && { opacity: 0.85 }]}>
          <Ionicons name="share-social" size={18} color="#fff" />
          <Text style={styles.primaryText}>Share review</Text>
        </Pressable>
        <Pressable onPress={copyLink} style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}>
          <Ionicons name={copied ? "checkmark" : "copy-outline"} size={17} color={colors.fg} />
          <Text style={styles.secondaryText}>{copied ? "Link copied" : "Copy link"}</Text>
        </Pressable>

        {!posterReady && !uploadFailed && <ActivityIndicator color={colors.brand} />}
        {uploadFailed && <Text style={styles.muted}>The preview picture didn't upload, but the link still works.</Text>}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.note}>Anyone with the link can see this review.</Text>
        {share.justSaved && (
          <Pressable onPress={closeSheet} style={styles.later}>
            <Text style={styles.laterText}>Not now</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.panel },
  center: { alignItems: "center", justifyContent: "center", gap: 16, padding: 32 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  topTitle: { color: colors.fg, fontSize: 16, fontWeight: "700" },
  content: { padding: 20, gap: 12 },
  lead: { color: colors.soft, fontSize: 15, textAlign: "center", marginBottom: 4 },
  cardFrame: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: 14,
    overflow: "hidden",
    transformOrigin: "top left",
  },
  caption: { color: colors.muted, fontSize: 12, textAlign: "center", marginBottom: 8 },
  primary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.brand,
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
  },
  secondaryText: { color: colors.fg, fontSize: 15, fontWeight: "600" },
  muted: { color: colors.muted, fontSize: 13, textAlign: "center" },
  error: { color: colors.disagree, fontSize: 14, textAlign: "center" },
  note: { color: colors.muted, fontSize: 12, textAlign: "center" },
  later: { alignItems: "center", padding: 10 },
  laterText: { color: colors.soft, fontSize: 15, fontWeight: "600" },
  closeText: { color: colors.brandSoft, fontSize: 15, fontWeight: "600" },
});
