import { useEffect, useRef } from "react";
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
  myReview,
  myReviewCounts,
  progress,
  reviewed,
  searchResults,
  useDemoClock,
  useSharePicture,
} from "./demoData";

/* The phone's screen is drawn at a real phone's size (390 x 800) and shrunk to fit the frame */
const screenWidth = 390;
const screenHeight = 800;
const scale = 258 / screenWidth;

/* Scrolls `ref`'s box to `p` (0 to 1) of the way to `target` (a child's ref, or "end") */
const useScrollTo = (ref, targetRef, p) => {
  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    const goal =
      targetRef === "end" ? box.scrollHeight - box.clientHeight : (targetRef.current?.offsetTop ?? 0) - 12;
    box.scrollTop = Math.max(0, goal) * p;
  }, [ref, targetRef, p]);
};

/* Search results (Search.jsx on a phone: one narrow column) */
const Results = ({ scroll = 1, tap = 0, show = 1 }) => {
  const box = useRef(null);
  const target = useRef(null);
  useScrollTo(box, target, scroll);
  return (
    <div ref={box} className="h-full overflow-hidden px-4 py-6" style={{ opacity: show }}>
      <div className="pb-6">
        <DemoHeading title="Results for “dune”" subtitle="4 movies found" />
      </div>
      <div className="mx-auto flex max-w-[19rem] flex-col gap-4">
        {searchResults.map((movie) => (
          <div key={`${movie.title}${movie.year}`} ref={movie === reviewed ? target : undefined}>
            <DemoCard movie={movie} overview tap={movie === reviewed ? tap : 0} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Feed = ({ local }) => {
  const box = useRef(null);
  useScrollTo(box, "end", progress(local, 500, 900));
  const { counts, reactors } = myReviewCounts(local);
  return (
    <div ref={box} className="h-full overflow-hidden px-4 py-6">
      <div className="pb-6">
        <DemoHeading title="Latest activity" subtitle="What you and the people you follow watched lately." />
      </div>
      <div className="mx-auto max-w-[19rem]">
        <DemoCard movie={reviewed} review={myReview} counts={counts} reactors={reactors} />
      </div>
    </div>
  );
};

const Screen = ({ step, local, picture }) => {
  if (step === 0) {
    const typed = "dune".slice(0, Math.floor(progress(local, 300, 800) * 4));
    const results = progress(local, 1300, 300);
    return (
      <>
        <DemoHeader search={typed} typing={local < 1300} />
        <div className="relative flex-1 overflow-hidden">
          {results === 0 ? (
            <div className="flex flex-col items-center gap-3 px-6 py-24 text-center">
              <p className="text-5xl">🔎</p>
              <p className="text-xl font-bold text-[#f5f5f7]">Search for a movie</p>
              <p className="text-sm text-[#bdbdc9]">Type a title in the search bar at the top to find a movie.</p>
            </div>
          ) : (
            <Results show={results} scroll={progress(local, 1900, 800)} tap={progress(local, 3500, 450)} />
          )}
        </div>
      </>
    );
  }

  if (step === 1 || step === 2) {
    /* The popups open over the search results */
    return (
      <>
        <DemoHeader search="dune" />
        <div className="relative flex-1 overflow-hidden">
          <Results />
          <Backdrop p={progress(local, 0, 250)}>
            <div className="w-full" style={enter(progress(local, 0, 300), 24)}>
              {step === 1 ? <DemoReviewForm local={local} /> : <DemoShareModal local={local} picture={picture} />}
            </div>
          </Backdrop>
          {step === 2 && (
            <div
              className="absolute inset-x-0 bottom-0 z-30"
              style={{ transform: `translateY(${(1 - progress(local, 2300, 380)) * 110}%)` }}
            >
              <ShareSheet />
            </div>
          )}
        </div>
      </>
    );
  }

  const bell = progress(local, 1700, 300);
  return (
    <>
      <DemoHeader active="Feed" unread={local > 1100 && local < 1700 ? 1 : 0} bellTap={progress(local, 1500, 450)} />
      <div className="relative flex-1 overflow-hidden">
        <Feed local={local} />
        <div className="absolute right-3 top-1 z-30">
          <DemoNotifications style={{ ...enter(bell, -10), width: "21rem" }} />
        </div>
      </div>
    </>
  );
};

const PhoneDemo = () => {
  const clock = useDemoClock();
  const picture = useSharePicture();

  return (
    <div className="flex w-[20rem] flex-col items-center gap-5">
      <div
        className="relative overflow-hidden rounded-[2.6rem] border-[7px] border-[#24222f] bg-[#09090d] text-left shadow-2xl shadow-black/60"
        style={{ width: screenWidth * scale + 14, height: screenHeight * scale + 14 }}
        aria-hidden="true"
      >
        <div
          className="flex origin-top-left flex-col"
          style={{ width: screenWidth, height: screenHeight, transform: `scale(${scale})` }}
        >
          {/* Status bar */}
          <div className="relative flex h-11 shrink-0 items-center justify-between px-7 text-[15px] font-semibold text-white">
            <span>9:41</span>
            <span className="absolute left-1/2 top-2.5 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-end gap-0.5">
              <span className="h-1.5 w-1 rounded-sm bg-white" />
              <span className="h-2.5 w-1 rounded-sm bg-white" />
              <span className="h-3.5 w-1 rounded-sm bg-white" />
            </span>
          </div>
          <Screen step={clock.step} local={clock.local} picture={picture} />
        </div>
      </div>

      <DemoSteps clock={clock} className="w-full" />
    </div>
  );
};

export default PhoneDemo;
