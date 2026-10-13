import { avatarFor } from "../avatars";
import { posterUrl } from "./tmdb";
import { releaseYear } from "./dates";

/* The address people see on shared posts, whichever address the app was opened from */
export const siteUrl = "https://justseenapp.com";

/* Instagram's portrait size, which also looks right on WhatsApp, X and Facebook */
const width = 1080;
const height = 1350;
const pad = 80;

const display = '"Bricolage Grotesque", "Geist", sans-serif';
const body = '"Geist", system-ui, sans-serif';

/* The text that goes with the image (some apps keep it, Instagram drops it) */
export const shareText = ({ movie, rating }) =>
  `I gave ${movie.title} ${Number(rating)}/5 on JustSeen. Movies are better with friends, join me: ${siteUrl}`;

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
  const kept = lines.slice(0, max);
  let last = kept[max - 1];
  while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
  kept[max - 1] = `${last.trimEnd()}…`;
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

  ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
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

/* The JustSeen mark (same shapes as LogoMark), `size` tall, top-left at (x, y) */
const drawLogo = (ctx, x, y, size) => {
  const scale = size / 250;
  ctx.save();
  ctx.translate(x - 118 * scale, y - 70 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = "#7c5cff";
  ctx.beginPath();
  ctx.arc(187, 212, 64, 0, Math.PI * 2);
  ctx.fill();
  ctx.fill(new Path2D("M140 175 C 150 125, 190 92, 230 76 L 240 86 C 214 104, 200 126, 198 150 Z"));
  ctx.strokeStyle = "#7c5cff";
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

/* Builds the picture people post: poster, stars, review, who wrote it and an invite.
Resolves to a JPEG Blob */
export const drawShareCard = async ({ movie, rating, review, author }) => {
  /* Canvas only uses web fonts that have finished loading */
  try {
    await Promise.all([
      document.fonts.load(`800 64px ${display}`),
      document.fonts.load(`600 36px ${body}`),
      document.fonts.load(`400 40px ${body}`),
    ]);
  } catch {
    /* Falls back to system fonts */
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  /* Background: the login page's dark cinema look with two soft glows */
  ctx.fillStyle = "#0b0a14";
  ctx.fillRect(0, 0, width, height);
  const glow = (x, y, r, color) => {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, "rgba(11, 10, 20, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };
  glow(140, 120, 760, "rgba(124, 92, 255, 0.38)");
  glow(1000, 1300, 680, "rgba(192, 38, 211, 0.22)");

  /* Who reviewed it */
  const avatarSize = 84;
  await drawAvatar(ctx, author, pad, pad, avatarSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#ffffff";
  ctx.font = `600 38px ${body}`;
  ctx.fillText(author?.name ?? "", pad + avatarSize + 26, pad + 38, width - pad * 2 - avatarSize - 26);
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `400 28px ${body}`;
  ctx.fillText("reviewed a movie on JustSeen", pad + avatarSize + 26, pad + 78);

  /* The poster, with a soft shadow */
  const posterX = pad;
  const posterY = 220;
  const posterW = 340;
  const posterH = 510;
  const poster = movie.poster_path ? await loadImage(posterUrl(movie.poster_path, "w500")) : null;
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 24;
  roundedRect(ctx, posterX, posterY, posterW, posterH, 28);
  ctx.fillStyle = "#1a1825";
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundedRect(ctx, posterX, posterY, posterW, posterH, 28);
  ctx.clip();
  if (poster) {
    drawCover(ctx, poster, posterX, posterY, posterW, posterH);
  } else {
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.font = `700 40px ${display}`;
    ctx.textAlign = "center";
    const lines = limitLines(ctx, wrapLines(ctx, movie.title, posterW - 60), 5, posterW - 60);
    lines.forEach((line, i) => ctx.fillText(line, posterX + posterW / 2, posterY + posterH / 2 + (i - (lines.length - 1) / 2) * 50));
    ctx.textAlign = "left";
  }
  ctx.restore();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
  ctx.lineWidth = 2;
  roundedRect(ctx, posterX, posterY, posterW, posterH, 28);
  ctx.stroke();

  /* Title, year and stars beside the poster */
  const sideX = posterX + posterW + 56;
  const sideW = width - pad - sideX;
  let titleSize = 66;
  ctx.font = `800 ${titleSize}px ${display}`;
  let titleLines = wrapLines(ctx, movie.title, sideW);
  /* Long titles get a smaller size before being cut */
  while (titleLines.length > 3 && titleSize > 44) {
    titleSize -= 6;
    ctx.font = `800 ${titleSize}px ${display}`;
    titleLines = wrapLines(ctx, movie.title, sideW);
  }
  titleLines = limitLines(ctx, titleLines, 4, sideW);
  ctx.fillStyle = "#ffffff";
  /* Centre the title, year and stars beside the poster */
  const year = releaseYear(movie.release_date);
  const starR = 30;
  const blockH = titleLines.length * titleSize * 1.08 + (year ? 48 : 0) + 50 + starR + 56;
  let cursor = posterY + Math.max(0, (posterH - blockH) / 2) + titleSize * 0.85;
  for (const line of titleLines) {
    ctx.fillText(line, sideX, cursor);
    cursor += titleSize * 1.08;
  }

  if (year) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = `400 32px ${body}`;
    ctx.fillText(year, sideX, cursor + 8);
    cursor += 48;
  }

  const stars = Number(rating);
  const starY = cursor + 50;
  for (let i = 0; i < 5; i++) {
    drawStar(ctx, sideX + starR + i * (starR * 2 + 12), starY, starR, Math.min(1, Math.max(0, stars - i)));
  }
  ctx.fillStyle = "#fbbf24";
  ctx.font = `600 34px ${body}`;
  ctx.fillText(`${stars} / 5`, sideX, starY + starR + 56);

  /* The review itself, shrinking the text if it's long so it always fits */
  const text = (review ?? "").trim();
  if (text) {
    const textTop = posterY + posterH + 70;
    const textBottom = 1170;
    const textW = width - pad * 2;
    /* The quote mark sits in the first 40px */
    const area = textBottom - textTop - 40;
    let size = 42;
    let lines;
    for (;;) {
      ctx.font = `400 ${size}px ${body}`;
      lines = wrapLines(ctx, text, textW);
      if (lines.length * size * 1.4 <= area || size <= 30) break;
      size -= 2;
    }
    lines = limitLines(ctx, lines, Math.max(1, Math.floor(area / (size * 1.4))), textW);

    ctx.fillStyle = "#b4a3ff";
    ctx.font = `800 120px ${display}`;
    ctx.fillText("“", pad - 8, textTop + 62);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.font = `400 ${size}px ${body}`;
    lines.forEach((line, i) => ctx.fillText(line, pad, textTop + 40 + size + i * size * 1.4));
  }

  /* Footer: logo, name and the invitation */
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(pad, 1210, width - pad * 2, 2);
  const logoW = drawLogo(ctx, pad, 1240, 46);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 40px ${display}`;
  ctx.fillText("JustSeen", pad + logoW + 16, 1278);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.font = `400 26px ${body}`;
  ctx.fillText("Movies are better with friends", width - pad, 1256);
  ctx.fillStyle = "#b4a3ff";
  ctx.font = `600 30px ${body}`;
  ctx.fillText(siteUrl.replace("https://", ""), width - pad, 1294);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Couldn't create the image"))), "image/jpeg", 0.92),
  );
};
