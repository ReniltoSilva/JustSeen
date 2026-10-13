import { useEffect, useRef, useState } from "react";
import { LogoMark } from "./Logo";
import UserAvatar from "./UserAvatar";
import { NeutralIcon, SearchIcon, ShareIcon, StarPlusIcon, ThumbDownIcon, ThumbUpIcon, starPath } from "./icons";

/* A looping, phone-sized walkthrough of JustSeen for the welcome page: find a movie,
rate it, share it, and see friends react. Everything is drawn in code (no video), with
fixed dark colours like the rest of the welcome panel */

const sceneLength = 4600;
const scenes = ["Find a movie", "Rate & review", "Share it", "Friends react"];

const movie = { title: "Dune: Part Two", year: 2024, poster: "https://image.tmdb.org/t/p/w342/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg" };
const review = "Saw it on the biggest screen I could find. Worth every minute.";
const me = { name: "You", username: "you", avatar: "animal:fox" };
const friends = [
  { name: "Leo", username: "leo", avatar: "animal:owl" },
  { name: "Sofia", username: "sofia", avatar: "animal:penguin" },
  { name: "Ana", username: "ana", avatar: "animal:koala" },
];

const clamp = (value) => Math.min(1, Math.max(0, value));

/* 0 before `start`, rising to 1 over `duration` ms */
const progress = (local, start, duration) => clamp((local - start) / duration);

/* Slides and fades in as `p` goes from 0 to 1 */
const enter = (p, distance = 12) => ({
  opacity: p,
  transform: `translateY(${(1 - p) * distance}px)`,
});

const Stars = ({ rating, size = "w-5 h-5" }) => (
  <span className="flex gap-1">
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = clamp(rating - i);
      return (
        <span key={i} className={`relative ${size}`}>
          <svg viewBox="0 0 16 16" className="absolute inset-0 h-full w-full text-white/15" fill="currentColor">
            <path d={starPath} />
          </svg>
          <svg
            viewBox="0 0 16 16"
            className="absolute inset-0 h-full w-full text-amber-400"
            fill="currentColor"
            style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }}
          >
            <path d={starPath} />
          </svg>
        </span>
      );
    })}
  </span>
);

/* A finger tap: a ring that grows and fades */
const Tap = ({ p }) =>
  p > 0 && p < 1 ? (
    <span
      className="pointer-events-none absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
      style={{ opacity: 1 - p, transform: `translate(-50%, -50%) scale(${0.4 + p})` }}
    />
  ) : null;

const SearchScene = ({ local }) => {
  const typed = "dune".slice(0, Math.floor(progress(local, 300, 800) * 4));
  const result = progress(local, 1300, 350);
  const tap = progress(local, 3200, 450);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex h-10 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 text-sm ring-1 ring-white/10">
        <SearchIcon className="h-4 w-4 text-white/50" />
        <span className="text-white">{typed}</span>
        {local < 1300 && <span className="h-4 w-px animate-pulse bg-[#b4a3ff]" />}
        {!typed && <span className="text-white/40">Search movies...</span>}
      </div>
      <div style={enter(result)} className="overflow-hidden rounded-2xl border border-white/10 bg-[#131318]">
        <div className="relative">
          <img src={movie.poster} alt="" className="aspect-[4/5] w-full object-cover" />
          <span
            className={`absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full ring-1 ring-white/20 backdrop-blur-md transition-colors ${
              tap > 0 ? "bg-[#7c5cff]" : "bg-black/45"
            }`}
          >
            <StarPlusIcon className="h-4 w-4 text-white" />
            <Tap p={tap} />
          </span>
        </div>
        <div className="flex items-center justify-between px-3 py-2.5">
          <p className="text-sm font-semibold text-white">{movie.title}</p>
          <span className="text-xs text-white/50">{movie.year}</span>
        </div>
      </div>
    </div>
  );
};

const ReviewScene = ({ local }) => {
  const sheet = progress(local, 0, 350);
  const rating = Math.floor(progress(local, 500, 1100) * 9) / 2;
  const typed = review.slice(0, Math.floor(progress(local, 1700, 1700) * review.length));
  const tap = progress(local, 3700, 450);
  const saved = local > 3900;
  return (
    <div className="relative h-full">
      <img src={movie.poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25 blur-sm" />
      <div
        style={{ transform: `translateY(${(1 - sheet) * 100}%)` }}
        className="absolute inset-x-0 bottom-0 flex flex-col gap-4 rounded-t-3xl border-t border-white/10 bg-[#131318] p-4"
      >
        <div className="flex items-center gap-3">
          <img src={movie.poster} alt="" className="h-14 w-10 rounded-md object-cover" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-white/50">Your review</p>
            <p className="text-sm font-bold text-white">{movie.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Stars rating={rating} size="h-6 w-6" />
          <span className="text-xs font-semibold tabular-nums text-amber-400">{rating ? `${rating} / 5` : ""}</span>
        </div>
        <div className="min-h-[5.5rem] rounded-xl bg-[#0b0a14] p-3 text-[13px] leading-relaxed text-white/90 ring-1 ring-white/10">
          {typed || <span className="text-white/40">What did you think?</span>}
          {typed && typed.length < review.length && <span className="ml-px inline-block h-3.5 w-px animate-pulse bg-[#b4a3ff] align-middle" />}
        </div>
        <span
          className={`relative mx-auto flex h-10 w-full items-center justify-center rounded-full text-sm font-semibold text-white transition-colors ${
            saved ? "bg-emerald-500" : "bg-[#7c5cff]"
          }`}
        >
          {saved ? "Saved ✓" : "Save"}
          <Tap p={tap} />
        </span>
      </div>
    </div>
  );
};

const ShareScene = ({ local }) => {
  const card = progress(local, 0, 400);
  const tap = progress(local, 1800, 450);
  const menu = progress(local, 2200, 380);
  const apps = [
    { name: "WhatsApp", color: "bg-[#25D366]" },
    { name: "Instagram", color: "bg-[linear-gradient(45deg,#f09433,#dc2743,#bc1888)]" },
    { name: "Messages", color: "bg-[#34C759]" },
    { name: "X", color: "bg-black ring-1 ring-white/20" },
  ];
  return (
    <div className="relative flex h-full flex-col items-center gap-4 p-4">
      {/* A mini version of the picture JustSeen makes for you */}
      <div style={enter(card)} className="relative w-full overflow-hidden rounded-2xl ring-1 ring-white/10">
        <img src={movie.poster} alt="" className="absolute inset-0 h-full w-full scale-150 object-cover opacity-50 blur-xl" />
        <div className="relative flex flex-col gap-3 bg-[#0b0a14]/60 p-3.5">
          <div className="flex items-center gap-3">
            <img src={movie.poster} alt="" className="w-[4.5rem] rounded-lg object-cover shadow-lg" />
            <div>
              <p className="font-display text-base font-extrabold leading-tight text-white">{movie.title}</p>
              <p className="text-[10px] text-white/60">{movie.year}</p>
              <div className="mt-1.5">
                <Stars rating={4.5} size="h-3.5 w-3.5" />
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-white/[0.08] p-2.5 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <UserAvatar user={me} className="w-5" />
              <span className="text-[10px] font-semibold text-white">You</span>
              <span className="text-[9px] text-white/50">recommend this one</span>
            </div>
            <p className="mt-1.5 text-[10px] leading-snug text-white/85">{review}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[10px] font-bold text-white">
              <LogoMark className="h-2.5 w-auto" /> JustSeen
            </span>
            <span className="rounded-full bg-[#7c5cff] px-2 py-0.5 text-[8px] font-semibold text-white">
              Join me on justseenapp.com
            </span>
          </div>
        </div>
      </div>
      <span className="relative flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#7c5cff] text-sm font-semibold text-white">
        <ShareIcon />
        Share review
        <Tap p={tap} />
      </span>

      {/* The phone's own share menu */}
      <div
        style={{ transform: `translateY(${(1 - menu) * 110}%)` }}
        className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t border-white/10 bg-[#1c1b24] px-4 pb-5 pt-3"
      >
        <span className="mx-auto mb-3 block h-1 w-9 rounded-full bg-white/20" />
        <div className="grid grid-cols-4 gap-2">
          {apps.map((app) => (
            <span key={app.name} className="flex flex-col items-center gap-1.5">
              <span className={`h-11 w-11 rounded-2xl ${app.color}`} />
              <span className="text-[9px] text-white/70">{app.name}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const FeedScene = ({ local }) => {
  const card = progress(local, 0, 400);
  const toast = progress(local, 1300, 350);
  const agrees = local > 3000 ? 3 : local > 2300 ? 2 : local > 1500 ? 1 : 0;
  const unsure = local > 2700 ? 1 : 0;
  const reactors = friends.slice(0, agrees);
  return (
    <div className="relative flex h-full flex-col p-4">
      {/* Notification */}
      <div
        style={{ ...enter(toast, -16) }}
        className="absolute inset-x-3 top-2 z-10 flex items-center gap-2.5 rounded-2xl bg-[#26243a]/95 p-2.5 shadow-xl ring-1 ring-white/10 backdrop-blur"
      >
        <UserAvatar user={friends[0]} className="w-7" />
        <p className="text-[11px] leading-snug text-white">
          <span className="font-semibold">Leo</span> agreed with your review of {movie.title}
        </p>
      </div>

      <div style={enter(card)} className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-[#131318]">
        <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
          <UserAvatar user={me} className="w-7" />
          <div className="leading-tight">
            <p className="text-xs font-semibold text-white">You</p>
            <p className="text-[10px] text-white/50">Watched today</p>
          </div>
        </div>
        <img src={movie.poster} alt="" className="aspect-[16/10] w-full object-cover object-[center_75%]" />
        <div className="px-3 pb-3 pt-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{movie.title}</p>
            <Stars rating={4.5} size="h-3 w-3" />
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-white/75">{review}</p>
          <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[11px] font-medium tabular-nums">
            <span className="flex gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <ThumbUpIcon className="h-3 w-3" />
                {agrees}
              </span>
              <span className="flex items-center gap-1 text-[#a1a1b5]">
                <NeutralIcon className="h-3 w-3" />
                {unsure}
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <ThumbDownIcon className="h-3 w-3" />0
              </span>
            </span>
            <span className="flex -space-x-1.5">
              {reactors.map((friend) => (
                <span key={friend.username} className="rounded-full ring-2 ring-[#131318]">
                  <UserAvatar user={friend} className="w-5" />
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const sceneComponents = [SearchScene, ReviewScene, ShareScene, FeedScene];

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const loopLength = sceneLength * scenes.length;

const LoginDemo = () => {
  /* Milliseconds into the loop, measured from a real clock so it stays right even when the
  browser slows timers down. People who turn animations off see each scene's finished
  state instead, and move between scenes with the step buttons */
  const [reduced] = useState(prefersReducedMotion);
  const [elapsed, setElapsed] = useState(reduced ? sceneLength - 1 : 0);
  /* When the loop started, and a step someone asked to jump to (the timer picks it up) */
  const origin = useRef(0);
  const jumpRequest = useRef(null);

  useEffect(() => {
    if (reduced) return;
    origin.current = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (jumpRequest.current !== null) {
        origin.current = now - jumpRequest.current;
        jumpRequest.current = null;
      }
      setElapsed((now - origin.current) % loopLength);
    }, 50);
    return () => clearInterval(timer);
  }, [reduced]);

  const step = Math.floor(elapsed / sceneLength) % scenes.length;
  const local = elapsed % sceneLength;
  const Scene = sceneComponents[step];

  const jumpTo = (i) => {
    jumpRequest.current = i * sceneLength;
    setElapsed(i * sceneLength + (reduced ? sceneLength - 1 : 0));
  };

  return (
    <div className="flex w-[20rem] flex-col items-center gap-5">
      {/* The phone */}
      <div
        className="relative h-[34rem] w-[17rem] overflow-hidden rounded-[2.6rem] border-[7px] border-[#24222f] bg-[#0b0a14] text-left shadow-2xl shadow-black/60"
        aria-hidden="true"
      >
        <div className="flex h-11 items-center justify-between px-5 pt-1 text-[11px] font-semibold text-white">
          <span>9:41</span>
          <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          <span className="flex items-center gap-1">
            <LogoMark className="h-2.5 w-auto" />
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 top-11">
          <Scene key={step} local={local} />
        </div>
      </div>

      {/* Steps, filling up like stories; tap one to jump to it */}
      <ol className="grid w-full grid-cols-4 gap-2">
        {scenes.map((label, i) => (
          <li key={label}>
            <button type="button" onClick={() => jumpTo(i)} className="flex w-full flex-col gap-1.5 text-left">
              <span className="h-1 overflow-hidden rounded-full bg-white/15">
                <span
                  className="block h-full rounded-full bg-[#b4a3ff]"
                  style={{ width: `${i < step ? 100 : i === step ? (reduced ? 100 : (local / sceneLength) * 100) : 0}%` }}
                />
              </span>
              <span className={`text-[11px] font-semibold leading-tight ${i === step ? "text-white" : "text-white/45"}`}>
                {i + 1}. {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default LoginDemo;
