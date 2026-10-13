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
        <DemoCard key={`${movie.title}${movie.year}`} movie={movie} overview tap={movie === reviewed ? tap : 0} />
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
        <DemoHeader wide search={typed} typing={local < 1300} />
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
      <DemoHeader wide active="Feed" unread={local > 1300 && local < 1700 ? 1 : 0} />
      <div className="relative flex-1 overflow-hidden">
        <Feed local={local} />
        <div className="absolute right-6 top-2 z-30">
          <DemoNotifications style={enter(bell, -10)} />
        </div>
      </div>
    </>
  );
};

const DesktopDemo = () => {
  const clock = useDemoClock();
  const picture = useSharePicture();
  const box = useRef(null);
  const [width, setWidth] = useState(0);

  /* Follow the space the welcome panel gives us */
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(box.current);
    return () => observer.disconnect();
  }, []);

  const scale = width / pageWidth;

  return (
    <div ref={box} className="flex w-full flex-col gap-5">
      <div
        className="relative overflow-hidden rounded-xl border border-white/10 bg-[#09090d] text-left shadow-2xl shadow-black/60"
        style={{ height: (pageHeight + barHeight) * scale }}
        aria-hidden="true"
      >
        {width > 0 && (
          <div
            className="flex origin-top-left flex-col"
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
          </div>
        )}
      </div>

      <DemoSteps clock={clock} className="mx-auto w-full max-w-md" />
    </div>
  );
};

export default DesktopDemo;
