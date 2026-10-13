import { useEffect, useRef, useState } from "react";
import {
  Backdrop,
  DemoCard,
  DemoHeader,
  DemoHeading,
  DemoNotifications,
  DemoReviewForm,
  DemoShareModal,
  DemoSteps,
  ShareSheet,
} from "./demoKit";
import {
  enter,
  friendReviews,
  myReview,
  myReviewCounts,
  progress,
  reviewed,
  searchResults,
  useDemoClock,
  useSharePicture,
} from "./demoData";

/* The browser window is drawn at a real laptop's size and shrunk to the space available */
const pageWidth = 1280;
const pageHeight = 720;
const barHeight = 40;

/* Five columns, like Masonry.jsx at this width */
const Grid = ({ children }) => <div className="grid grid-cols-5 items-start gap-6">{children}</div>;

const Results = ({ tap = 0, show = 1 }) => (
  <div className="px-8 py-8" style={{ opacity: show }}>
    <div className="pb-6">
      <DemoHeading title="Results for “dune”" subtitle="4 movies found" />
    </div>
    <Grid>
      {searchResults.map((movie) => (
        <DemoCard
          key={`${movie.title}${movie.year}`}
          movie={movie}
          overview
          target={movie === reviewed}
          tap={movie === reviewed ? tap : 0}
        />
      ))}
    </Grid>
  </div>
);

const Feed = ({ local }) => {
  const { counts, reactors } = myReviewCounts(local);
  return (
    <div className="px-8 py-8">
      <div className="pb-6">
        <DemoHeading title="Latest activity" subtitle="What you and the people you follow watched lately, newest first." />
      </div>
      <Grid>
        <DemoCard movie={reviewed} review={myReview} counts={counts} reactors={reactors} />
        {friendReviews.map((review) => (
          <DemoCard key={review.movie.title} movie={review.movie} review={review} counts={review.counts} />
        ))}
      </Grid>
    </div>
  );
};

const addressFor = ["justseenapp.com/search?q=dune", "justseenapp.com/search?q=dune", "justseenapp.com/search?q=dune", "justseenapp.com"];

const Screen = ({ step, local, picture }) => {
  if (step === 0) {
    const typed = "dune".slice(0, Math.floor(progress(local, 300, 800) * 4));
    const results = progress(local, 1300, 300);
    return (
      <>
        <DemoHeader wide search={typed} typing={local > 250 && local < 1300} />
        <div className="relative flex-1 overflow-hidden">
          {results === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-32 text-center">
              <p className="text-5xl">🔎</p>
              <p className="text-xl font-bold text-[#f5f5f7]">Search for a movie</p>
              <p className="text-sm text-[#bdbdc9]">Type a title in the search bar at the top to find a movie.</p>
            </div>
          ) : (
            <Results show={results} tap={progress(local, 3300, 450)} />
          )}
        </div>
      </>
    );
  }

  if (step === 1 || step === 2) {
    return (
      <>
        <DemoHeader wide search="dune" />
        <div className="relative flex-1 overflow-hidden">
          <Results />
          <Backdrop p={progress(local, 0, 250)}>
            <div className="flex w-full justify-center" style={enter(progress(local, 0, 300), 24)}>
              {step === 1 ? <DemoReviewForm local={local} /> : <DemoShareModal local={local} picture={picture} />}
            </div>
          </Backdrop>
          {step === 2 && (
            <div className="absolute bottom-6 right-6 z-30 w-[26rem]" style={enter(progress(local, 2300, 350), 20)}>
              <ShareSheet className="rounded-3xl border border-white/10 shadow-2xl" />
            </div>
          )}
        </div>
      </>
    );
  }

  const bell = progress(local, 1700, 300);
  return (
    <>
      <DemoHeader wide active="Feed" unread={local > 1100 && local < 1700 ? 1 : 0} bellTap={progress(local, 1600, 400)} />
      <div className="relative flex-1 overflow-hidden">
        <Feed local={local} />
        <div className="absolute right-6 top-2 z-30">
          <DemoNotifications style={enter(bell, -10)} />
        </div>
      </div>
    </>
  );
};

/* Where the mouse goes in each scene: a point on the page, or a [data-tap] element,
reached at `at` ms after gliding for `move` ms. `click` makes it press down there */
const cursorPaths = [
  [
    { at: 0, to: [900, 520] },
    { at: 300, to: "search", move: 300, click: true },
    { at: 1500, to: [760, 300], move: 600 },
    { at: 3300, to: "star", move: 800, click: true },
  ],
  [
    { at: 0, to: "star" },
    { at: 700, to: "rating", move: 500 },
    { at: 1900, to: "text", move: 500 },
    { at: 3700, to: "save", move: 800, click: true },
  ],
  [
    { at: 0, to: "save" },
    { at: 1800, to: "share", move: 800, click: true },
    { at: 3300, to: "whatsapp", move: 700, click: true },
  ],
  [
    { at: 0, to: [640, 420] },
    { at: 1600, to: "bell", move: 900, click: true },
  ],
];

const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/* A mouse pointer that glides between targets and clicks them. It moves itself (no React
state), reading where each target is on the page every time the clock ticks */
const Cursor = ({ pageRef, step, local, scale }) => {
  const pointer = useRef(null);
  const last = useRef([900, 520]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !pointer.current || !scale) return;
    const pageBox = page.getBoundingClientRect();
    const spot = (to) => {
      if (Array.isArray(to)) return to;
      const target = page.querySelector(`[data-tap="${to}"]`);
      if (!target) return null;
      const box = target.getBoundingClientRect();
      return [(box.left - pageBox.left + box.width / 2) / scale, (box.top - pageBox.top + box.height / 2) / scale];
    };

    const path = cursorPaths[step];
    let next = path.findIndex((point) => point.at > local);
    if (next === -1) next = path.length;
    const from = path[next - 1] ?? path[0];
    const fromSpot = spot(from.to) ?? last.current;
    let position = fromSpot;
    const pressed = from.click && local - from.at < 250;

    const to = path[next];
    if (to) {
      const t = progress(local, to.at - (to.move ?? 500), to.move ?? 500);
      const toSpot = spot(to.to) ?? fromSpot;
      position = [fromSpot[0] + (toSpot[0] - fromSpot[0]) * ease(t), fromSpot[1] + (toSpot[1] - fromSpot[1]) * ease(t)];
    }
    last.current = position;
    pointer.current.style.transform = `translate(${position[0]}px, ${position[1]}px) scale(${pressed ? 0.85 : 1})`;
  }, [pageRef, step, local, scale]);

  return (
    <svg
      ref={pointer}
      viewBox="0 0 24 24"
      className="pointer-events-none absolute left-0 top-0 z-50 h-7 w-7 origin-top-left drop-shadow-lg"
      aria-hidden="true"
    >
      <path d="M4 2.5v17.2l4.6-4.4 3 6.7 2.8-1.2-3-6.6h6.4z" fill="white" stroke="black" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
};

const DesktopDemo = () => {
  const clock = useDemoClock();
  const picture = useSharePicture();
  const box = useRef(null);
  const page = useRef(null);
  const [width, setWidth] = useState(0);

  /* Follow the space we're given */
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);

  const scale = width / pageWidth;

  return (
    <div className="flex min-w-0 flex-col gap-5">
      <div ref={box} className="w-full">
        <div
          className="relative overflow-hidden rounded-xl border border-white/10 bg-[#09090d] text-left shadow-2xl shadow-black/60 ring-1 ring-black/40"
          style={{ height: (pageHeight + barHeight) * scale }}
          aria-hidden="true"
        >
          {width > 0 && (
            <div
              ref={page}
              className="relative flex origin-top-left flex-col"
              style={{ width: pageWidth, height: pageHeight + barHeight, transform: `scale(${scale})` }}
            >
              {/* Browser bar */}
              <div className="flex shrink-0 items-center gap-4 border-b border-white/10 bg-[#1c1b24] px-4" style={{ height: barHeight }}>
                <span className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </span>
                <span className="mx-auto w-96 rounded-md bg-black/30 py-1 text-center text-xs text-white/60">
                  {addressFor[clock.step]}
                </span>
                <span className="w-12" />
              </div>
              <Screen step={clock.step} local={clock.local} picture={picture} />
              {!clock.reduced && <Cursor pageRef={page} step={clock.step} local={clock.local} scale={scale} />}
            </div>
          )}
        </div>
      </div>
      <DemoSteps clock={clock} className="mx-auto w-full max-w-md" />
    </div>
  );
};

export default DesktopDemo;
