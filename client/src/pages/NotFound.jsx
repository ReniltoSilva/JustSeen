import { Link } from "react-router-dom";
import { usePageMeta } from "../lib/usePageMeta";

/* Any address that doesn't match a page */
const NotFound = () => {
  usePageMeta({ title: "Page not found" });

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-32 text-center text-fg">
      <p className="text-6xl">🎞️</p>
      <h1 className="text-3xl font-bold">This scene got cut</h1>
      <p className="text-soft max-w-sm">
        The page you're looking for doesn't exist, or it moved somewhere else.
      </p>
      <Link
        to="/"
        className="mt-2 rounded-full bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-hover"
      >
        Back to the feed
      </Link>
    </div>
  );
};

export default NotFound;
