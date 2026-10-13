import { useEffect, useRef, useState } from "react";
import { drawShareCard } from "../../lib/shareCard";

/* Data, timing and hooks for the welcome-page demos (the components are in demoKit.jsx) */

/* ---------- Timing ---------- */

export const sceneLength = 4600;
export const sceneLabels = ["Find a movie", "Rate & review", "Share it", "Friends react"];
export const sceneDetails = [
  "Search any film. Posters and details come straight from TMDB.",
  "Give it stars and a few honest words. No essays needed.",
  "JustSeen turns your review into a picture for WhatsApp, Instagram and more.",
  "Friends agree, disagree or aren't sure, and you get a notification.",
];
const loopLength = sceneLength * sceneLabels.length;

export const clamp = (value) => Math.min(1, Math.max(0, value));

/* 0 before `start`, rising to 1 over `duration` ms */
export const progress = (local, start, duration) => clamp((local - start) / duration);

/* Slides and fades in as `p` goes from 0 to 1 */
export const enter = (p, distance = 12) => ({ opacity: p, transform: `translateY(${(1 - p) * distance}px)` });

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* The loop's clock, measured from real time so it stays right even when the browser
slows timers down. People who turn animations off see each scene's finished state,
and move between scenes with the step buttons */
export const useDemoClock = () => {
  const [reduced] = useState(prefersReducedMotion);
  const [elapsed, setElapsed] = useState(reduced ? sceneLength - 1 : 0);
  const origin = useRef(0);
  /* A step someone asked to jump to; the timer picks it up */
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

  const jumpTo = (i) => {
    jumpRequest.current = i * sceneLength;
    setElapsed(i * sceneLength + (reduced ? sceneLength - 1 : 0));
  };

  return {
    step: Math.floor(elapsed / sceneLength) % sceneLabels.length,
    local: elapsed % sceneLength,
    reduced,
    jumpTo,
  };
};

/* ---------- Pretend data (real movies, made-up people) ---------- */

const poster = (path) => `https://image.tmdb.org/t/p/w342${path}`;

export const you = { name: "Alex Rivera", username: "alexrivera", avatar: "animal:fox" };
export const leo = { name: "Leo", username: "leo", avatar: "animal:owl" };
export const sofia = { name: "Sofia", username: "sofia", avatar: "animal:penguin" };
export const maya = { name: "Maya", username: "maya", avatar: "animal:koala" };

/* What a search for "dune" really returns, in TMDB's order */
export const searchResults = [
  {
    title: "Dune",
    year: 2021,
    poster: poster("/v1tRXZ4JtD2Iv6fjkPvT4GiwslV.jpg"),
    genres: ["Science Fiction", "Adventure"],
    overview: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding…",
  },
  {
    title: "Dune: Part Two",
    year: 2024,
    poster: poster("/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg"),
    genres: ["Science Fiction", "Adventure"],
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge…",
  },
  {
    title: "Dune",
    year: 1984,
    poster: poster("/4kJmUCE7mkVJjXa7A0g2rY4IGTm.jpg"),
    genres: ["Action", "Science Fiction", "Adventure"],
    overview: "In the year 10,191, the most precious substance in the universe is the spice Melange…",
  },
  {
    title: "Dune: Part Three",
    year: 2026,
    poster: poster("/d43fvHQsIMa4kpyhKXw0haEJIvI.jpg"),
    genres: ["Science Fiction", "Adventure"],
    overview: "Nearly two decades after he seized control of the Imperium, Paul Atreides is now a ruthless emperor…",
  },
];

export const reviewed = searchResults[1];
export const reviewText = "Saw it on the biggest screen I could find. Worth every minute.";
export const reviewRating = 4.5;

/* Friends' reviews in the desktop feed */
export const friendReviews = [
  {
    author: leo,
    when: "Watched yesterday",
    movie: { title: "Coyote vs. Acme", year: 2026, poster: poster("/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg"), genres: ["Comedy", "Family"] },
    rating: 4,
    review: "Laughed the whole way through. Perfect with the kids.",
    counts: [7, 0, 1],
  },
  {
    author: sofia,
    when: "Watched Sunday",
    movie: { title: "Runner", year: 2026, poster: poster("/yBKMAIj7clP42UkFejhGDBBoTpb.jpg"), genres: ["Action", "Comedy"] },
    rating: 3.5,
    review: "Silly fun. Turn your brain off and enjoy the chases.",
    counts: [4, 2, 1],
  },
  {
    author: maya,
    when: "Watched Oct 4",
    movie: { title: "Bullet Train", year: 2022, poster: poster("/j8szC8OgrejDQjjMKSVXyaAjw3V.jpg"), genres: ["Action", "Comedy"] },
    rating: 4,
    review: "Chaotic in the best way. Brad Pitt is having so much fun.",
    counts: [9, 1, 0],
  },
];

/* The real share picture, made once by the same code that makes it in the app */
let sharePicture = null;
const loadSharePicture = () => {
  sharePicture ??= drawShareCard({
    movie: { title: reviewed.title, poster_path: "/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg", release_date: "2024-02-27" },
    rating: reviewRating,
    review: reviewText,
    author: you,
  }).then((blob) => URL.createObjectURL(blob));
  return sharePicture;
};

export const useSharePicture = () => {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let cancelled = false;
    loadSharePicture()
      .then((picture) => !cancelled && setUrl(picture))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return url;
};

/* My new review as it appears in the feed, with friends' reactions arriving */
export const myReviewCounts = (local) => {
  const agrees = local > 3000 ? 3 : local > 2300 ? 2 : local > 1200 ? 1 : 0;
  return { counts: [agrees, local > 2700 ? 1 : 0, 0], reactors: [leo, sofia, maya].slice(0, agrees) };
};

export const myReview = { author: you, when: "Watched today", rating: reviewRating, review: reviewText };
