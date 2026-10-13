import { avatarFor } from "../avatars";
import { posterUrl } from "./tmdb";
import { releaseYear } from "./dates";

/* The address people see on shared posts, whichever address the app was opened from */
export const siteUrl = "https://justseenapp.com";

/* The text that goes with the picture (some apps keep it, Instagram drops it) */
export const shareText = ({ movie, rating }) =>
  `I gave ${movie.title} ${Number(rating)}/5 on JustSeen. Movies are better with friends, join me:`;

/* Instagram's tallest allowed portrait is 1080 x 1350; shorter reviews make shorter pictures */
const width = 1080;
const maxHeight = 1350;
const pad = 72;

const display = '"Bricolage Grotesque Variable", "Geist Variable", sans-serif';
const body = '"Geist Variable", system-ui, sans-serif';

/* A friendly line under the name, based on the rating */
const verdict = (rating) => {
  if (rating >= 4) return "recommends this one";
  if (rating <= 2) return "wasn't a fan";
  return "watched this one";
};

/* Splits text into lines that fit `maxWidth`; long words are broken up too */
const wrapLines = (ctx, text, maxWidth) => {
  const lines = [];
  for (const paragraph of text.split(/\n+/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth) {
        line = next;
        continue;
      }
      if (line) lines.push(line);
      line = word;
      /* A single word wider than the box: cut it into pieces */
      while (ctx.measureText(line).width > maxWidth) {
        let cut = line.length - 1;
        while (cut > 1 && ctx.measureText(line.slice(0, cut)).width > maxWidth) cut--;
        lines.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    if (line) lines.push(line);
  }
  return lines;
};

/* Keeps at most `max` lines, ending the last one with "…" if text was cut */
const limitLines = (ctx, lines, max, maxWidth) => {
  if (lines.length <= max) return lines;
  const kept = lines.slice(0, Math.max(1, max));
  let last = kept[kept.length - 1];
  while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
  kept[kept.length - 1] = `${last.trimEnd()}…`;
  return kept;
};

const roundedRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
};

/* Five-pointed star centred on (cx, cy), filled up to `fill` (0 to 1) from the left */
const drawStar = (ctx, cx, cy, r, fill) => {
  const path = new Path2D();
  for (let i = 0; i < 10; i++) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  }
  path.closePath();

  ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
  ctx.fill(path);
  if (fill > 0) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - r, cy - r, r * 2 * fill, r * 2);
    ctx.clip();
    ctx.fillStyle = "#fbbf24";
    ctx.fill(path);
    ctx.restore();
  }
};

/* The JustSeen mark (same shapes as LogoMark), `size` tall, top-left at (x, y); returns its width */
const drawLogo = (ctx, x, y, size, color) => {
  const scale = size / 250;
  ctx.save();
  ctx.translate(x - 118 * scale, y - 70 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(187, 212, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.fill(new Path2D("M140 175 C 150 125, 190 92, 230 76 L 240 86 C 214 104, 200 126, 198 150 Z"));
  ctx.strokeStyle = color;
  ctx.lineWidth = 30;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke(new Path2D("M246 120 L 466 103 Q 482 102 482 118 L 482 284 Q 482 300 466 299 L 236 282"));
  ctx.restore();
  return 382 * scale;
};

/* Downloads an image in a way the canvas is allowed to use (TMDB allows it).
"no-store" skips the browser's saved copy: if a card already showed this poster,
that copy lacks the header that lets a canvas use it, and the download would fail */
const loadImage = async (src) => {
  try {
    const response = await fetch(src, { cache: "no-store" });
    if (!response.ok) return null;
    return await createImageBitmap(await response.blob());
  } catch {
    return null;
  }
};

/* Draws `image` to fill the box, cropping whatever doesn't fit (like object-fit: cover) */
const drawCover = (ctx, image, x, y, w, h) => {
  const scale = Math.max(w / image.width, h / image.height);
  const sw = w / scale;
  const sh = h / scale;
  ctx.drawImage(image, (image.width - sw) / 2, (image.height - sh) / 2, sw, sh, x, y, w, h);
};

/* A very blurry copy of the poster: shrinking it to a few pixels and stretching it back
blurs it the same way in every browser (canvas blur filters aren't supported everywhere) */
const drawBlurredBackdrop = (ctx, image, w, h) => {
  const tiny = document.createElement("canvas");
  tiny.width = 12;
  tiny.height = Math.round((12 * h) / w);
  const tctx = tiny.getContext("2d");
  tctx.imageSmoothingQuality = "high";
  drawCover(tctx, image, 0, 0, tiny.width, tiny.height);

  const mid = document.createElement("canvas");
  mid.width = 96;
  mid.height = Math.round((96 * h) / w);
  const mctx = mid.getContext("2d");
  mctx.imageSmoothingQuality = "high";
  mctx.drawImage(tiny, 0, 0, mid.width, mid.height);

  ctx.save();
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(mid, 0, 0, w, h);
  ctx.restore();
};

const drawAvatar = async (ctx, user, x, y, size) => {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();

  const avatar = avatarFor(user);
  const photo = avatar.type === "photo" ? await loadImage(avatar.src) : null;
  if (photo) {
    drawCover(ctx, photo, x, y, size, size);
  } else {
    const animal = avatar.animal ?? avatarFor({ username: user?.username }).animal;
    const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
    gradient.addColorStop(0, animal.from);
    gradient.addColorStop(1, animal.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, size, size);
    ctx.font = `${size * 0.66}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(animal.emoji, x + size / 2, y + size * 0.55);
  }
  ctx.restore();
};

/* Builds the picture people post: poster, stars, the review as a message from a friend,
and an invitation. Resolves to a JPEG Blob */
export const drawShareCard = async ({ movie, rating, review, author }) => {
  /* Canvas only uses web fonts that have finished loading */
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${display}`),
      document.fonts.load(`600 34px ${body}`),
      document.fonts.load(`400 38px ${body}`),
    ]);
  } catch {
    /* Falls back to system fonts */
  }

  const poster = movie.poster_path ? await loadImage(posterUrl(movie.poster_path, "w500")) : null;
  const stars = Number(rating);
  const text = (review ?? "").trim();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = maxHeight;
  const ctx = canvas.getContext("2d");

  /* ---- Measure first, so the picture is exactly as tall as what's in it ---- */
  const posterX = pad;
  const posterY = pad;
  const posterW = 320;
  const posterH = 480;

  const sideX = posterX + posterW + 56;
  const sideW = width - pad - sideX;
  let titleSize = 68;
  ctx.font = `800 ${titleSize}px ${display}`;
  let titleLines = wrapLines(ctx, movie.title, sideW);
  /* Long titles get a smaller size before being cut */
  while (titleLines.length > 3 && titleSize > 44) {
    titleSize -= 6;
    ctx.font = `800 ${titleSize}px ${display}`;
    titleLines = wrapLines(ctx, movie.title, sideW);
  }
  titleLines = limitLines(ctx, titleLines, 4, sideW);

  const bubbleX = pad;
  const bubbleY = posterY + posterH + 56;
  const bubbleW = width - pad * 2;
  const bubblePad = 40;
  const avatarSize = 72;
  const textW = bubbleW - bubblePad * 2;
  const footerH = 72;
  const footerGap = 52;

  /* The review shrinks (down to 30px) rather than making the picture taller than 1350 */
  let textSize = 38;
  let lines = [];
  if (text) {
    const textTop = bubbleY + bubblePad + avatarSize + 28;
    const room = maxHeight - pad - footerH - footerGap - bubblePad - textTop;
    for (;;) {
      ctx.font = `400 ${textSize}px ${body}`;
      lines = wrapLines(ctx, text, textW);
      if (lines.length * textSize * 1.42 <= room || textSize <= 30) break;
      textSize -= 2;
    }
    lines = limitLines(ctx, lines, Math.floor(room / (textSize * 1.42)), textW);
  }
  const lineHeight = textSize * 1.42;
  const textBlock = lines.length ? 28 + (lines.length - 1) * lineHeight + textSize : 0;
  const bubbleH = bubblePad * 2 + avatarSize + textBlock;
  const footerY = bubbleY + bubbleH + footerGap;
  const height = Math.min(maxHeight, Math.ceil(footerY + footerH + pad));

  /* Setting the size clears the canvas and its settings, so drawing starts here */
  canvas.height = height;

  /* ---- Background: the poster's colours, blurred and darkened ---- */
  ctx.fillStyle = "#0b0a14";
  ctx.fillRect(0, 0, width, height);
  if (poster) drawBlurredBackdrop(ctx, poster, width, height);
  const shade = ctx.createLinearGradient(0, 0, 0, height);
  shade.addColorStop(0, "rgba(11, 10, 20, 0.55)");
  shade.addColorStop(0.55, "rgba(11, 10, 20, 0.78)");
  shade.addColorStop(1, "rgba(11, 10, 20, 0.94)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width, height, 0, width, height, 760);
  glow.addColorStop(0, "rgba(124, 92, 255, 0.35)");
  glow.addColorStop(1, "rgba(124, 92, 255, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  /* ---- Poster with a soft shadow ---- */
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
  ctx.shadowBlur = 56;
  ctx.shadowOffsetY = 22;
  roundedRect(ctx, posterX, posterY, posterW, posterH, 24);
  ctx.fillStyle = "#1a1825";
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundedRect(ctx, posterX, posterY, posterW, posterH, 24);
  ctx.clip();
  if (poster) {
    drawCover(ctx, poster, posterX, posterY, posterW, posterH);
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `700 38px ${display}`;
    ctx.textAlign = "center";
    const placeholder = limitLines(ctx, wrapLines(ctx, movie.title, posterW - 56), 5, posterW - 56);
    placeholder.forEach((line, i) =>
      ctx.fillText(line, posterX + posterW / 2, posterY + posterH / 2 + (i - (placeholder.length - 1) / 2) * 48),
    );
    ctx.textAlign = "left";
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 2;
  roundedRect(ctx, posterX, posterY, posterW, posterH, 24);
  ctx.stroke();

  /* ---- Title, year and stars, centred beside the poster ---- */
  const year = releaseYear(movie.release_date);
  const starR = 28;
  const sideH = titleLines.length * titleSize * 1.06 + (year ? 46 : 0) + 34 + starR * 2 + 50;
  let cursor = posterY + Math.max(0, (posterH - sideH) / 2) + titleSize * 0.85;
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 ${titleSize}px ${display}`;
  for (const line of titleLines) {
    ctx.fillText(line, sideX, cursor);
    cursor += titleSize * 1.06;
  }
  if (year) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = `400 30px ${body}`;
    ctx.fillText(year, sideX, cursor + 4);
    cursor += 46;
  }
  const starY = cursor + 34;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, sideX + starR + i * (starR * 2 + 10), starY, starR, Math.min(1, Math.max(0, stars - i)));
  }
  ctx.fillStyle = "#fbbf24";
  ctx.font = `600 32px ${body}`;
  ctx.fillText(`${stars} / 5`, sideX, starY + starR + 50);

  /* ---- The review, as a message from the friend who wrote it ---- */
  roundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 36);
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
  ctx.lineWidth = 2;
  ctx.stroke();

  /* A big faint quote mark in the corner, when there are words to quote */
  if (lines.length) {
    ctx.fillStyle = "rgba(180, 163, 255, 0.35)";
    ctx.font = `800 150px ${display}`;
    ctx.textAlign = "right";
    ctx.fillText("”", bubbleX + bubbleW - 34, bubbleY + 128);
    ctx.textAlign = "left";
  }

  await drawAvatar(ctx, author, bubbleX + bubblePad, bubbleY + bubblePad, avatarSize);
  const nameX = bubbleX + bubblePad + avatarSize + 22;
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 34px ${body}`;
  ctx.fillText(author?.name ?? "", nameX, bubbleY + bubblePad + 32, bubbleW - (nameX - bubbleX) - 120);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `400 27px ${body}`;
  ctx.fillText(verdict(stars), nameX, bubbleY + bubblePad + 68);

  if (lines.length) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.font = `400 ${textSize}px ${body}`;
    const firstLine = bubbleY + bubblePad + avatarSize + 28 + textSize * 0.85;
    lines.forEach((line, i) => ctx.fillText(line, bubbleX + bubblePad, firstLine + i * lineHeight));
  }

  /* ---- Footer: who we are, and the invitation ---- */
  const logoW = drawLogo(ctx, pad, footerY + 6, 40, "#8b72ff");
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 36px ${display}`;
  ctx.fillText("JustSeen", pad + logoW + 14, footerY + 36);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `400 24px ${body}`;
  ctx.fillText("Movies are better with friends", pad, footerY + 70);

  const invite = `Join me on ${siteUrl.replace("https://", "")}`;
  ctx.font = `600 28px ${body}`;
  const pillW = ctx.measureText(invite).width + 64;
  const pillH = 64;
  const pillX = width - pad - pillW;
  const pillY = footerY + (footerH - pillH) / 2 + 4;
  roundedRect(ctx, pillX, pillY, pillW, pillH, pillH / 2);
  ctx.fillStyle = "#7c5cff";
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  ctx.fillText(invite, pillX + 32, pillY + pillH / 2 + 1);
  ctx.textBaseline = "alphabetic";

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the image"))), "image/jpeg", 0.92),
  );
};
