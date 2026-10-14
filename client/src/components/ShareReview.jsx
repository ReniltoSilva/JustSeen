import { useEffect, useRef, useState } from "react";
import { drawLinkPreview, drawShareCard, shareText } from "../lib/shareCard";
import { siteUrl } from "../lib/site";
import { markShared, reviewLink, uploadSharePicture } from "../data/sharing";
import { CheckIcon, CopyIcon, DownloadIcon, FacebookLogo, ShareIcon, WhatsAppLogo, XLogo } from "./icons";

/* "dune-part-two" from "Dune: Part Two", for the downloaded file's name */
const slug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "review";

/* Phones and tablets share through their own menu; computers get buttons instead,
since their share menus only list installed apps */
const isTouchDevice = () => window.matchMedia("(pointer: coarse)").matches;

const primaryButton =
  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover";
const secondaryButton =
  "flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold text-fg ring-1 ring-line-strong transition hover:bg-fg/5";
const brandButton =
  "group flex flex-col items-center gap-1.5 text-xs font-medium text-soft transition hover:text-fg";

/* A picture of a review, plus a link that shows that picture as its preview.
On phones "Share review" opens the phone's share menu (WhatsApp, Instagram...);
on computers there are WhatsApp / X / Facebook buttons, copy link and download */
const ShareReview = ({ movie, rating, review, author, reviewId }) => {
  const [image, setImage] = useState(null);
  const [failed, setFailed] = useState(false);
  const [linkFailed, setLinkFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState("");
  const [touch] = useState(isTouchDevice);
  /* The preview picture's upload, started as soon as the window opens so it's ready
  by the time an app fetches the link */
  const upload = useRef(null);

  /* Draw the portrait picture once; the preview and the buttons use the same one */
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

  /* Upload the wide link-preview picture in the background */
  useEffect(() => {
    if (!reviewId || !author?.id) return;
    let cancelled = false;
    upload.current = drawLinkPreview({ movie, rating, review, author }).then((blob) =>
      uploadSharePicture(author.id, reviewId, blob),
    );
    upload.current.catch((error) => {
      console.error("Failed to upload the link preview:", error);
      if (!cancelled) setLinkFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [movie, rating, review, author, reviewId]);

  const hasLink = Boolean(reviewId) && !linkFailed;
  const link = hasLink ? reviewLink(reviewId) : siteUrl;
  const text = shareText({ movie, rating });

  /* Sharing is what makes the link work for other people. It runs in the background so
  the share menu or the new tab opens straight away */
  const publish = () => {
    if (!hasLink) return;
    upload.current
      ?.then(() => markShared(reviewId))
      .catch((error) => console.error("Failed to publish the review link:", error));
  };

  const canShareImage = Boolean(image && navigator.canShare?.({ files: [image.file] }));

  const shareFromPhone = async () => {
    setShareError("");
    publish();
    try {
      await navigator.share({ files: [image.file], text: `${text} ${link}` });
    } catch (error) {
      /* Closing the share menu counts as an error too; that one is fine */
      if (error.name !== "AbortError") setShareError("Sharing didn't work here. Download the picture instead.");
    }
  };

  const copyLink = async () => {
    publish();
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareError(`Couldn't copy. The link is ${link}`);
    }
  };

  const socialLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`,
      icon: <WhatsAppLogo className="h-5 w-5" />,
      color: "bg-[#25D366]",
    },
    {
      label: "X",
      href: `https://x.com/intent/post?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      icon: <XLogo className="h-[1.1rem] w-[1.1rem]" />,
      color: "bg-black ring-1 ring-white/20",
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      icon: <FacebookLogo className="h-5 w-5" />,
      color: "bg-[#1877F2]",
    },
  ];

  const downloadButton = (className) => (
    <a href={image.url} download={image.file.name} className={className}>
      <DownloadIcon />
      Download picture
    </a>
  );

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

      {image && touch && canShareImage && (
        <div className="flex flex-col gap-2">
          <button type="button" onClick={shareFromPhone} className={primaryButton}>
            <ShareIcon />
            Share review
          </button>
          {shareError && downloadButton(secondaryButton)}
        </div>
      )}

      {image && !(touch && canShareImage) && (
        <div className="flex flex-col gap-4">
          {/* Each one opens the site with the text and link filled in; the link's
          preview shows the review card */}
          <div className="flex items-start justify-center gap-6">
            {socialLinks.map((item) => (
              <a key={item.label} href={item.href} target="_blank" rel="noreferrer" onClick={publish} className={brandButton}>
                <span className={`grid h-12 w-12 place-items-center rounded-full text-white transition group-hover:scale-105 ${item.color}`}>
                  {item.icon}
                </span>
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={copyLink} className={secondaryButton}>
              {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon />}
              {copied ? "Link copied" : "Copy link"}
            </button>
            {downloadButton(secondaryButton)}
          </div>
        </div>
      )}

      {hasLink && image && <p className="text-center text-xs text-muted">Anyone with the link can see this review.</p>}
      {shareError && <p className="text-center text-sm text-disagree">{shareError}</p>}
    </div>
  );
};

export default ShareReview;
