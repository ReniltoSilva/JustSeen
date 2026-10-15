import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchTitles } from "../lib/tmdb";
import { mixLabel, titleKey } from "../lib/titles";
import MovieCard from "../components/MovieCard";
import Masonry from "../components/Masonry";
import PageHeading from "../components/PageHeading";
import EmptyState from "../components/EmptyState";
import { MovieGridSkeleton } from "../components/Skeletons";
import { usePageMeta } from "../lib/usePageMeta";

/* Movie and TV show search through TMDB */
const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  usePageMeta({ title: query ? `"${query}"` : "Search" });

  /* Results are stored with the query they belong to, so a new search never shows old results */
  const [search, setSearch] = useState({ query: "", titles: [], page: 0, totalPages: 0 });
  const [error, setError] = useState("");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    searchTitles(query, 1)
      .then((data) => {
        if (cancelled) return;
        setSearch({ query, ...data, page: 1 });
        setError("");
      })
      .catch((err) => {
        console.error("Search failed:", err);
        if (!cancelled) setError("Search isn't working right now. Please try again in a moment.");
      });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const current = search.query === query;
  const loading = Boolean(query) && !current && !error;

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const data = await searchTitles(query, search.page + 1);
      /* TMDB can repeat a title across pages */
      setSearch((prev) => {
        const seen = new Set(prev.titles.map(titleKey));
        return {
          ...prev,
          page: prev.page + 1,
          titles: [...prev.titles, ...data.titles.filter((title) => !seen.has(titleKey(title)))],
        };
      });
    } catch (err) {
      console.error("Loading more results failed:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!query) {
    return (
      <EmptyState
        emoji="🔎"
        title="Search for a movie or show"
        message="Type a title in the search bar at the top to find a movie or TV show, then review it or save it for later."
      />
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <section className="pb-6">
          <PageHeading
            title={`Results for “${query}”`}
            subtitle={
              current ? (search.page < search.totalPages ? "Movies and TV shows" : `${mixLabel(search.titles)} found`) : "Searching..."
            }
          />
        </section>

        {error && <p className="text-sm text-disagree">{error}</p>}
        {loading && <MovieGridSkeleton withHeader={false} />}

        {current && search.titles.length === 0 && (
          <EmptyState emoji="🤔" title={`Nothing matches “${query}”`} message="Check the spelling or try another title." />
        )}

        {current && (
          <Masonry
            items={search.titles}
            getKey={titleKey}
            renderItem={(movie) => <MovieCard movie={movie} showOverviewText />}
          />
        )}

        {current && search.page < search.totalPages && search.titles.length > 0 && (
          <div className="flex justify-center pt-10 pb-16">
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="rounded-full border border-line-strong px-6 py-2.5 text-sm font-medium text-fg hover:bg-panel-2 transition-colors disabled:text-muted"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}

        <p className="pt-8 pb-4 text-center text-xs text-muted">
          Movie and TV data from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline">
            TMDB
          </a>
          . This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </div>
  );
};

export default Search;
