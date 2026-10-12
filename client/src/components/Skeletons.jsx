import Masonry from "./Masonry";

/* Grey shapes that pulse while data loads, so the page doesn't jump around */
const Bar = ({ className }) => <div className={`rounded-full bg-fg/[0.07] ${className}`} />;

export const MovieCardSkeleton = ({ withHeader = true, tall = false }) => (
  <div className="flex flex-col overflow-hidden rounded-2xl border border-line bg-panel animate-pulse" aria-hidden="true">
    {withHeader && (
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div className="h-9 w-9 rounded-full bg-fg/[0.07]" />
        <div className="flex flex-col gap-1.5">
          <Bar className="h-3 w-24" />
          <Bar className="h-2.5 w-16" />
        </div>
      </div>
    )}
    <div className="aspect-[2/3] w-full bg-fg/[0.05]" />
    <div className="flex flex-col gap-2 px-3.5 py-3">
      <Bar className="h-3.5 w-3/4" />
      <div className="flex gap-1">
        <Bar className="h-4 w-14" />
        <Bar className="h-4 w-16" />
      </div>
      {tall && (
        <>
          <Bar className="mt-1 h-2.5 w-full" />
          <Bar className="h-2.5 w-5/6" />
        </>
      )}
    </div>
  </div>
);

/* A page's worth of loading cards, laid out like the real thing */
export const MovieGridSkeleton = ({ count = 10, withHeader = true }) => (
  <Masonry
    items={Array.from({ length: count }, (_, index) => index)}
    getKey={(index) => index}
    renderItem={(index) => <MovieCardSkeleton withHeader={withHeader} tall={index % 3 !== 1} />}
  />
);

export const ProfileHeaderSkeleton = () => (
  <div className="max-w-7xl mx-auto rounded-3xl border border-line bg-panel p-6 md:p-8 animate-pulse" aria-hidden="true">
    <div className="flex items-center gap-5">
      <div className="h-20 w-20 rounded-full bg-fg/[0.07]" />
      <div className="flex flex-col gap-2.5">
        <Bar className="h-5 w-40" />
        <Bar className="h-3 w-24" />
        <Bar className="h-3 w-56" />
      </div>
    </div>
  </div>
);
