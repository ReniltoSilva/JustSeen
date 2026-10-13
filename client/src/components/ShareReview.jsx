import { useEffect, useState } from "react";
import { drawShareCard, shareText, siteUrl } from "../lib/shareCard";
import {
  CheckIcon,
  CopyIcon,
  DownloadIcon,
  FacebookLogo,
  InstagramLogo,
  ShareIcon,
  WhatsAppLogo,
  XLogo,
} from "./icons";

/* "dune-part-two" from "Dune: Part Two", for the downloaded file's name */
const slug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "review";

/* The modern clipboard only works on https (and localhost); the old way works everywhere else */
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    box.setAttribute("readonly", "");
    box.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    /* Inside an open popup, only the popup's own elements can be selected */
    (document.querySelector("dialog[open]") ?? document.body).appendChild(box);
    box.select();
    box.setSelectionRange(0, text.length);
    const copied = document.execCommand("copy");
    box.remove();
    return copied;
  }
};

const secondaryButton =
  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-fg ring-1 ring-line-strong transition hover:bg-fg/5";
const primaryButton =
  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover";
const brandButton =
  "grid h-11 w-11 place-items-center rounded-full text-white transition hover:scale-105 hover:brightness-110";

/* A picture of a review, ready to post. Phones open their own share menu
(Instagram, WhatsApp...); X, WhatsApp and Facebook also have their own buttons */
const ShareReview = ({ movie, rating, review, author }) => {
  const [image, setImage] = useState(null);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [hint, setHint] = useState("");

  /* Draw the picture once; the preview and every button use the same one */
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

  const text = shareText({ movie, rating });
  const fullText = `${text} ${siteUrl}`;
  const canShareImage = Boolean(image && navigator.canShare?.({ files: [image.file] }));

  /* These sites can't receive a picture from a web page, only text and a link */
  const socialLinks = [
    {
      label: "Post on X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(siteUrl)}`,
      icon: <XLogo />,
      className: "bg-black ring-1 ring-white/20",
    },
    {
      label: "Send on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(fullText)}`,
      icon: <WhatsAppLogo className="w-5 h-5" />,
      className: "bg-[#25D366]",
    },
    {
      label: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`,
      icon: <FacebookLogo className="w-5 h-5" />,
      className: "bg-[#1877F2]",
    },
  ];

  const share = async () => {
    setShareError("");
    try {
      await navigator.share({ files: [image.file], text: fullText });
    } catch (error) {
      /* Closing the share menu counts as an error too; that one is fine */
      if (error.name !== "AbortError") setShareError("Sharing didn't work here. Download the picture instead.");
    }
  };

  /* Instagram can't be opened with a picture from a website. Phones: the share menu
  (pick Instagram there). Computers: save the picture and open Instagram to post it */
  const shareToInstagram = () => {
    if (canShareImage) {
      share();
      return;
    }
    const link = document.createElement("a");
    link.href = image.url;
    link.download = image.file.name;
    link.click();
    window.open("https://www.instagram.com/", "_blank", "noreferrer");
    setHint("Picture downloaded. On Instagram, click Create and choose it.");
  };

  const copyText = async () => {
    setShareError("");
    if (await copyToClipboard(fullText)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setShareError("Couldn't copy the text on this browser.");
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
              Share picture
            </button>
          )}
          <div className="flex gap-2">
            <a href={image.url} download={image.file.name} className={canShareImage ? secondaryButton : primaryButton}>
              <DownloadIcon />
              Download
            </a>
            <button type="button" onClick={copyText} className={secondaryButton}>
              {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon />}
              {copied ? "Copied" : "Copy text"}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={shareToInstagram}
              title="Post on Instagram"
              aria-label="Post on Instagram"
              className={`${brandButton} bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)]`}
            >
              <InstagramLogo />
            </button>
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                title={link.label}
                aria-label={link.label}
                className={`${brandButton} ${link.className}`}
              >
                {link.icon}
              </a>
            ))}
          </div>
          <p className="text-center text-xs leading-relaxed text-muted">
            {hint ||
              "X, WhatsApp and Facebook only accept text and a link from websites. To include the picture, download it and add it to your post."}
          </p>
        </div>
      )}

      {shareError && <p className="text-center text-sm text-disagree">{shareError}</p>}
    </div>
  );
};

export default ShareReview;
