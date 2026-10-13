import { LogoMark } from "../Logo";
import UserAvatar from "../UserAvatar";
import { clamp, leo, progress, reviewText, reviewed, sceneLabels, sceneLength, you } from "./demoData";
import {
  BellIcon,
  BookmarkIcon,
  CheckIcon,
  EyeIcon,
  NeutralIcon,
  PencilIcon,
  SearchIcon,
  ShareIcon,
  StarIcon,
  StarPlusIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  starPath,
} from "../icons";

/* Shared pieces of the welcome-page demos (phone and desktop). They copy the real
components' look with the dark theme's colours written out, since the welcome panel is
always dark, and they draw a pretend screen that's played like a short video */

/* Steps under the demo, filling up like stories; tap one to jump to it */
export const DemoSteps = ({ clock, className = "" }) => (
  <ol className={`grid grid-cols-4 gap-2 ${className}`}>
    {sceneLabels.map((label, i) => {
      const fill = i < clock.step ? 1 : i === clock.step ? (clock.reduced ? 1 : clock.local / sceneLength) : 0;
      return (
        <li key={label}>
          <button type="button" onClick={() => clock.jumpTo(i)} className="flex w-full flex-col gap-1.5 text-left">
            <span className="h-1 overflow-hidden rounded-full bg-white/15">
              <span className="block h-full rounded-full bg-[#b4a3ff]" style={{ width: `${fill * 100}%` }} />
            </span>
            <span className={`text-[11px] font-semibold leading-tight ${i === clock.step ? "text-white" : "text-white/45"}`}>
              {i + 1}. {label}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

/* ---------- Small pieces ---------- */

/* A finger tap: a ring that grows and fades */
export const Tap = ({ p }) =>
  p > 0 && p < 1 ? (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 h-12 w-12 rounded-full border-2 border-white"
      style={{ opacity: 1 - p, transform: `translate(-50%, -50%) scale(${0.4 + p})` }}
    />
  ) : null;

/* The review form's big stars, filled to `rating` (halves allowed) */
export const Stars = ({ rating, className = "h-8 w-8" }) => (
  <span className="flex gap-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} className={`relative ${className}`}>
        <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full text-amber-400/20" fill="currentColor">
          <path d={starPath} />
        </svg>
        <svg
          viewBox="0 0 16 16"
          className="absolute inset-0 h-full w-full text-amber-400"
          fill="currentColor"
          style={{ clipPath: `inset(0 ${(1 - clamp(rating - i)) * 100}% 0 0)` }}
        >
          <path d={starPath} />
        </svg>
      </span>
    ))}
  </span>
);

/* A text field being typed into */
export const Typed = ({ text, placeholder, caret = true }) =>
  text ? (
    <>
      {text}
      {caret && <span className="ml-px inline-block h-[1.1em] w-px animate-pulse bg-[#b4a3ff] align-middle" />}
    </>
  ) : (
    <span className="text-[#8c8c9a]">{placeholder}</span>
  );

/* ---------- Copies of the app's components ---------- */

/* Header (Header.jsx). `wide` is the desktop layout with the nav inline */
export const DemoHeader = ({ wide = false, search = "", typing = false, active = "", unread = 0, bellTap = 0 }) => (
  <header className="border-b border-[#25252f] bg-[#09090d]">
    <div className={`flex h-16 items-center ${wide ? "gap-8 px-8" : "gap-3 px-4"}`}>
      <span className="flex shrink-0 items-center gap-2">
        <LogoMark className="h-7 w-auto" />
        <span className="font-display text-xl font-bold tracking-tight text-[#f5f5f7]">JustSeen</span>
      </span>
      <div data-tap="search" className={`relative flex h-10 min-w-0 flex-1 items-center rounded-full border bg-[#131318] pl-10 pr-4 text-sm ${wide ? "max-w-md" : ""} ${typing ? "border-[#7c5cff] ring-2 ring-[#7c5cff]/25" : "border-[#25252f]"}`}>
        <SearchIcon className="absolute left-3.5 h-4 w-4 text-[#8c8c9a]" />
        <span className="truncate text-[#f5f5f7]">
          <Typed text={search} placeholder="Search movies..." caret={typing} />
        </span>
      </div>
      {wide && <DemoNav active={active} className="ml-auto h-16 gap-6" />}
      <span className="flex shrink-0 items-center gap-1.5">
        <span data-tap="bell" className="relative grid h-9 w-9 place-items-center text-[#bdbdc9]">
          <BellIcon />
          <Tap p={bellTap} />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-[#fb7185] px-1 text-center text-[10px] font-bold leading-4 text-white">
              {unread}
            </span>
          )}
        </span>
        <UserAvatar user={you} className="w-9" />
      </span>
    </div>
    {!wide && <DemoNav active={active} className="h-11 justify-around border-t border-[#25252f]" />}
  </header>
);

const DemoNav = ({ active, className }) => (
  <nav className={`flex items-stretch ${className}`}>
    {["Feed", "Watched", "Watchlist", "People"].map((label) => (
      <span
        key={label}
        className={`relative flex items-center px-1 text-[15px] font-medium ${label === active ? "text-[#f5f5f7]" : "text-[#bdbdc9]"}`}
      >
        {label}
        {label === active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#7c5cff]" />}
      </span>
    ))}
  </nav>
);

/* PageHeading.jsx */
export const DemoHeading = ({ title, subtitle }) => (
  <div>
    <h1 className="text-2xl font-bold tracking-tight text-[#f5f5f7] md:text-3xl">{title}</h1>
    {subtitle && <p className="mt-1 text-sm text-[#8c8c9a]">{subtitle}</p>}
  </div>
);

const PosterButton = ({ children, tap = 0, highlight = false, target }) => (
  <span data-tap={target} className={`relative grid h-8 w-8 place-items-center rounded-full text-white transition-colors ${highlight ? "bg-white/25" : ""}`}>
    {children}
    <Tap p={tap} />
  </span>
);

/* MovieCard.jsx: a search result (no `review`) or someone's review */
export const DemoCard = ({ movie, review, tap = 0, target = false, counts = [0, 0, 0], reactors = [], overview = false }) => {
  const isMine = review?.author === you;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-[#25252f] bg-[#131318]">
      {review && (
        <div className="flex items-center gap-2.5 border-b border-white/[0.05] px-3 py-2.5">
          <span className="rounded-full ring-2 ring-white/10">
            <UserAvatar user={review.author} className="w-9" />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5 leading-tight">
            <span className="flex items-center gap-1.5">
              <span className="truncate text-sm font-semibold text-[#f5f5f7]">{review.author.name}</span>
              {isMine && (
                <span className="rounded-full bg-[#7c5cff]/20 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#b4a3ff]">
                  You
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 text-xs text-[#8c8c9a]">
              <EyeIcon />
              {review.when}
            </span>
          </div>
        </div>
      )}

      <div className="relative aspect-[2/3] w-full bg-[#1c1c24]">
        <img src={movie.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#131318] to-transparent" />
        <div className="absolute right-2 top-2 flex flex-col rounded-full bg-black/45 p-0.5 shadow-lg ring-1 ring-white/15 backdrop-blur-md">
          {isMine ? (
            <>
              <PosterButton>
                <span className="text-amber-400">
                  <PencilIcon />
                </span>
              </PosterButton>
              <PosterButton>
                <ShareIcon />
              </PosterButton>
            </>
          ) : (
            <>
              <PosterButton tap={tap} highlight={tap > 0} target={target ? "star" : undefined}>
                <StarPlusIcon />
              </PosterButton>
              <PosterButton>
                <BookmarkIcon />
              </PosterButton>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-[#f5f5f7]">{movie.title}</h3>
          <span className="flex shrink-0 items-center gap-2 pt-0.5 text-xs tabular-nums">
            {review && (
              <span className="flex items-center gap-0.5 font-semibold text-amber-500">
                <StarIcon className="h-3 w-3" />
                {review.rating}
              </span>
            )}
            <span className="text-[#8c8c9a]">{movie.year}</span>
          </span>
        </div>
        <ul className="mt-2 flex flex-wrap gap-1">
          {movie.genres.map((genre) => (
            <li key={genre} className="rounded-full px-2 py-0.5 text-[11px] font-medium text-[#bdbdc9] ring-1 ring-inset ring-white/10">
              {genre}
            </li>
          ))}
        </ul>
        {review?.review && <p className="mt-2.5 break-words text-[13px] leading-relaxed text-[#bdbdc9]">{review.review}</p>}
        {overview && movie.overview && <p className="mt-2.5 text-[13px] leading-relaxed text-[#bdbdc9]">{movie.overview}</p>}

        {/* ReactionBar.jsx */}
        {review && (
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[#34d399]/80">
                <ThumbUpIcon />
                {counts[0]}
              </span>
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[#a1a1b5]/80">
                <NeutralIcon />
                {counts[1]}
              </span>
              <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[#fb7185]/80">
                <ThumbDownIcon />
                {counts[2]}
              </span>
            </span>
            <span className="flex -space-x-2 p-0.5">
              {reactors.map((person) => (
                <span key={person.username} className="rounded-full ring-2 ring-[#131318]">
                  <UserAvatar user={person} className="w-5" />
                </span>
              ))}
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

/* The dimmed backdrop behind a popup (daisyUI modal) */
export const Backdrop = ({ p, children, align = "center" }) => (
  <div
    className={`absolute inset-0 z-20 flex justify-center bg-black/40 px-4 ${align === "center" ? "items-center" : "items-end"}`}
    style={{ opacity: p }}
  >
    {children}
  </div>
);

/* ReviewModal.jsx, being filled in. `local` is ms into the scene */
export const DemoReviewForm = ({ local }) => {
  const rating = Math.floor(progress(local, 500, 1100) * 9) / 2;
  const typed = reviewText.slice(0, Math.floor(progress(local, 1700, 1700) * reviewText.length));
  const saveTap = progress(local, 3700, 450);
  return (
    <div className="w-full max-w-lg rounded-3xl border border-[#25252f] bg-[#131318] p-6 text-[#f5f5f7] shadow-2xl">
      <div className="flex items-center gap-4 pr-8">
        <img src={reviewed.poster} alt="" className="aspect-[2/3] w-14 shrink-0 rounded-lg object-cover" />
        <div>
          <p className="text-xs uppercase tracking-wider text-[#8c8c9a]">Your review</p>
          <h3 className="text-lg font-bold leading-snug">{reviewed.title}</h3>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c9a]">Rating</span>
          <div data-tap="rating" className="flex items-center gap-4">
            <Stars rating={rating} />
            <span className="text-sm text-[#bdbdc9]">{rating ? `${rating} / 5` : "Pick a rating"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c9a]">Date watched</span>
          <span className="flex h-11 w-56 items-center rounded-xl border border-[#25252f] bg-[#09090d] px-3 text-sm">
            Today
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c9a]">Review</span>
          <div data-tap="text" className="h-24 rounded-2xl border border-[#25252f] bg-[#09090d] p-4 text-[15px] leading-relaxed">
            <Typed text={typed} placeholder="What did you think?" caret={typed.length < reviewText.length} />
          </div>
          <span className="self-end text-xs tabular-nums text-[#8c8c9a]">{typed.length} / 250</span>
        </div>
        <div className="flex items-center justify-end gap-2">
          <span className="rounded-full border border-[#383845] px-5 py-2.5 text-sm font-semibold">Cancel</span>
          <span data-tap="save" className="relative rounded-full bg-[#7c5cff] px-6 py-2.5 text-sm font-semibold text-white">
            Save
            <Tap p={saveTap} />
          </span>
        </div>
      </div>
    </div>
  );
};

/* ShareReviewModal.jsx, right after saving */
export const DemoShareModal = ({ local, picture }) => {
  const shareTap = progress(local, 1800, 450);
  return (
    <div className="w-full max-w-sm rounded-3xl border border-[#25252f] bg-[#131318] p-6 text-[#f5f5f7] shadow-2xl">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-[#34d399]">
        <CheckIcon className="h-3.5 w-3.5" />
        Review saved
      </p>
      <h3 className="text-lg font-bold">Share it with your friends?</h3>
      <p className="mb-5 mt-1 text-sm text-[#bdbdc9]">Post it anywhere and invite friends to JustSeen.</p>
      <div className="mx-auto w-full max-w-[17rem] overflow-hidden rounded-2xl bg-[#1c1c24] shadow-xl ring-1 ring-[#25252f]">
        {picture ? (
          <img src={picture} alt="" className="block w-full" />
        ) : (
          <div className="aspect-[4/5] w-full animate-pulse bg-white/[0.06]" />
        )}
      </div>
      <span data-tap="share" className="relative mt-4 flex items-center justify-center gap-2 rounded-full bg-[#7c5cff] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25">
        <ShareIcon />
        Share review
        <Tap p={shareTap} />
      </span>
      <p className="mt-3 text-center text-sm font-medium text-[#bdbdc9]">Not now</p>
    </div>
  );
};

/* The device's own share menu (drawn generically) */
const shareApps = [
  { name: "WhatsApp", color: "bg-[#25D366]" },
  { name: "Instagram", color: "bg-[linear-gradient(45deg,#f09433,#dc2743,#bc1888)]" },
  { name: "Messages", color: "bg-[#34C759]" },
  { name: "X", color: "bg-black ring-1 ring-white/20" },
];

export const ShareSheet = ({ className = "" }) => (
  <div className={`rounded-t-3xl border-t border-white/10 bg-[#1c1b24] px-5 pb-6 pt-3 ${className}`}>
    <span className="mx-auto mb-4 block h-1 w-10 rounded-full bg-white/20" />
    <div className="grid grid-cols-4 gap-3">
      {shareApps.map((app) => (
        <span key={app.name} className="flex flex-col items-center gap-2">
          <span data-tap={app.name === "WhatsApp" ? "whatsapp" : undefined} className={`h-14 w-14 rounded-2xl ${app.color}`} />
          <span className="text-xs text-white/70">{app.name}</span>
        </span>
      ))}
    </div>
  </div>
);

/* NotificationBell.jsx's open list, with one new reaction */
export const DemoNotifications = ({ style }) => (
  <div style={style} className="w-80 overflow-hidden rounded-2xl border border-[#25252f] bg-[#131318] shadow-2xl">
    <p className="border-b border-[#25252f] px-4 py-3 text-sm font-semibold text-[#f5f5f7]">Notifications</p>
    <div className="flex items-start gap-3 px-4 py-3">
      <UserAvatar user={leo} className="w-9" />
      <p className="min-w-0 flex-1 text-sm leading-snug text-[#bdbdc9]">
        <span className="font-semibold text-[#f5f5f7]">Leo</span> agreed with your review of {reviewed.title}
        <span className="mt-0.5 block text-xs text-[#8c8c9a]">just now</span>
      </p>
      <img src={reviewed.poster} alt="" className="aspect-[2/3] w-8 shrink-0 rounded object-cover" />
    </div>
  </div>
);
