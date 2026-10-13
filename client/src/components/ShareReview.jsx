import { useEffect, useState } from "react";
import { drawShareCard, shareText } from "../lib/shareCard";
import { siteUrl } from "../lib/site";
import { DownloadIcon, ShareIcon } from "./icons";

/* "dune-part-two" from "Dune: Part Two", for the downloaded file's name */
const slug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "review";

const primaryButton =
  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover";
const secondaryButton =
  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-fg ring-1 ring-line-strong transition hover:bg-fg/5";

/* A picture of a review, ready to post. "Share review" opens the device's own share menu
(WhatsApp, Instagram, X, Messenger...) with the picture, a short text and the link.
Browsers that can't share pictures get a download button instead */
const ShareReview = ({ movie, rating, review, author }) => {
  const [image, setImage] = useState(null);
  const [failed, setFailed] = useState(false);
  const [shareError, setShareError] = useState("");

  /* Draw the picture once; the preview and the buttons use the same one */
  useEffect(() => {
    let cancelled = false;
    let url = null;
    drawShareCard({ movie, rating, review, author })
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        const file = new File([blob], `justseen-${slug(movie.title)}.jpg`, { type: "image/jpeg" });
        setImage({ url, file });
      })
      .catch((error) => {
        console.error("Failed to create share image:", error);
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [movie, rating, review, author]);

  const canShareImage = Boolean(image && navigator.canShare?.({ files: [image.file] }));

  const share = async () => {
    setShareError("");
    try {
      await navigator.share({ files: [image.file], text: `${shareText({ movie, rating })} ${siteUrl}` });
    } catch (error) {
      /* Closing the share menu counts as an error too; that one is fine */
      if (error.name !== "AbortError") setShareError("Sharing didn't work here. Download the picture instead.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto w-full max-w-[17rem] overflow-hidden rounded-2xl bg-panel-2 shadow-xl ring-1 ring-line">
        {image ? (
          <img src={image.url} alt={`Your review of ${movie.title}, ready to share`} className="block w-full" />
        ) : failed ? (
          <p className="grid aspect-[4/5] place-items-center p-6 text-center text-sm text-muted">
            Couldn't create the picture. Check your connection and try again.
          </p>
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse bg-fg/[0.06]" aria-label="Creating your picture" />
        )}
      </div>

      {image && (
        <div className="flex flex-col gap-2">
          {canShareImage && (
            <button type="button" onClick={share} className={primaryButton}>
              <ShareIcon />
              Share review
            </button>
          )}
          {/* Only for browsers that can't share pictures, or when sharing failed */}
          {(!canShareImage || shareError) && (
            <a href={image.url} download={image.file.name} className={canShareImage ? secondaryButton : primaryButton}>
              <DownloadIcon />
              Download picture
            </a>
          )}
        </div>
      )}

      {shareError && <p className="text-center text-sm text-disagree">{shareError}</p>}
    </div>
  );
};

export default ShareReview;
