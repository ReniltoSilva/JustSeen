import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getProfileByUsername } from "../data/profiles";
import { getYearReviews } from "../data/reviews";
import { yearStats } from "../lib/yearStats";
import { posterUrl } from "../lib/tmdb";
import { formatDay, releaseYear } from "../lib/dates";
import UserAvatar from "../components/UserAvatar";
import BarChart from "../components/BarChart";
import EmptyState from "../components/EmptyState";
import { StarIcon } from "../components/icons";
import { usePageMeta } from "../lib/usePageMeta";
import { countLabel, isShow, titlePath } from "../lib/titles";

/* A block on the page; `accent` gives it the purple gradient */
const Panel = ({ children, className = "", accent = false }) => (
  <section
    className={`rounded-3xl border p-6 md:p-8 ${
      accent
        ? "border-transparent bg-gradient-to-br from-brand to-fuchsia-600 text-white"
        : "border-line bg-panel text-fg"
    } ${className}`}
  >
    {children}
  </section>
);

const Kicker = ({ children, light = false }) => (
  <p className={`text-xs font-semibold uppercase tracking-[0.14em] ${light ? "text-white/75" : "text-muted"}`}>
    {children}
  </p>
);

/* A movie or show as a small poster + title, linking to its page */
const MovieChip = ({ review, caption }) => (
  <Link to={titlePath(review)} className="group flex items-center gap-4">
    {posterUrl(review.poster_path, "w154") && (
      <img
        src={posterUrl(review.poster_path, "w154")}
        alt=""
        className="w-16 aspect-[2/3] rounded-xl object-cover shadow-lg ring-1 ring-fg/10"
      />
    )}
    <div className="min-w-0">
      <p className="font-display text-lg font-bold leading-snug group-hover:text-brand-soft">{review.title}</p>
      <p className="text-sm text-muted">{caption}</p>
    </div>
  </Link>
);

/* One person's year at the movies, Spotify-Wrapped style */
const YearInFilm = () => {
  const { username, year: yearParam } = useParams();
  const year = Number(yearParam);
  const { user } = useAuth();
  const [person, setPerson] = useState(null);
  usePageMeta({ title: person ? `${person.name}'s ${year} in film` : `${year} in film` });
  const [reviews, setReviews] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const found = await getProfileByUsername(username);
        if (cancelled) return;
        if (!found) return setStatus("missing");
        const list = await getYearReviews(found.id, year);
        if (cancelled) return;
        setPerson(found);
        setReviews(list);
        setStatus("ready");
      } catch (error) {
        console.error("Failed to load year in film:", error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username, year]);

  if (status === "missing" || status === "error" || !Number.isInteger(year)) {
    return <EmptyState emoji="🎞️" title="We couldn't find that year in film" actions={[{ to: "/", label: "Back to the feed" }]} />;
  }

  if (status === "loading") {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse" aria-hidden="true">
        <div className="h-64 rounded-3xl bg-fg/[0.05]" />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-3xl bg-fg/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  const isMe = person.id === user.id;
  const firstName = person.name.split(" ")[0];
  const stats = yearStats(reviews);
  const thisYear = new Date().getFullYear();
  const yearNav = (
    <div className="flex items-center gap-2 text-sm">
      <Link to={`/u/${person.username}/year/${year - 1}`} className="rounded-full px-3 py-1.5 text-muted hover:bg-fg/5 hover:text-fg">
        ← {year - 1}
      </Link>
      {year < thisYear && (
        <Link to={`/u/${person.username}/year/${year + 1}`} className="rounded-full px-3 py-1.5 text-muted hover:bg-fg/5 hover:text-fg">
          {year + 1} →
        </Link>
      )}
    </div>
  );

  if (stats.count === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex justify-end">{yearNav}</div>
        <EmptyState
          emoji="📽️"
          title={`Nothing logged in ${year}`}
          message={
            isMe
              ? "Review the movies and shows you watch and your year in film builds itself."
              : `${firstName} didn't log anything in ${year}.`
          }
          actions={isMe ? [{ to: "/search", label: "Log a movie or show" }] : []}
        />
      </div>
    );
  }

  const bigNumbers = [
    { value: stats.movies, label: stats.movies === 1 ? "movie" : "movies" },
    /* Shows only once there are some */
    ...(stats.shows ? [{ value: stats.shows, label: stats.shows === 1 ? "TV show" : "TV shows" }] : []),
    {
      value: stats.hours,
      label: `${stats.hours === 1 ? "hour" : "hours"}${stats.shows ? " of movies" : ""}`,
      note: stats.missingRuntime ? `${stats.missingRuntime} without runtime` : null,
    },
    { value: stats.average ? `★ ${stats.average}` : "—", label: "average rating" },
    { value: stats.streak, label: stats.streak === 1 ? "day streak" : "days in a row" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 flex flex-col gap-4 md:gap-5">
      {/* Opening */}
      <Panel accent className="relative overflow-hidden">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3">
            <Link to={`/u/${person.username}`} className="flex items-center gap-3">
              <UserAvatar user={person} className="w-10 ring-2 ring-white/40 rounded-full" />
              <span className="font-semibold">{person.name}</span>
            </Link>
            <div className="[&_a]:text-white/80 [&_a:hover]:bg-white/10 [&_a:hover]:text-white">{yearNav}</div>
          </div>
          <div>
            <Kicker light>{isMe ? "Your" : `${firstName}'s`} year in film</Kicker>
            <h1 className="mt-2 font-display text-6xl md:text-8xl font-extrabold tracking-tight">{year}</h1>
            <p className="mt-3 max-w-lg text-lg text-white/85">
              {[stats.movies && countLabel(stats.movies), stats.shows && countLabel(stats.shows, "tv")].filter(Boolean).join(" and ")}
              {stats.hours > 0 && `, about ${stats.hours} ${stats.hours === 1 ? "hour" : "hours"} in front of the screen`}
              {stats.topGenres[0] && `, and a soft spot for ${stats.topGenres[0].name.toLowerCase()}`}.
            </p>
          </div>
        </div>
      </Panel>

      {/* Headline numbers */}
      <div className={`grid grid-cols-2 gap-4 md:gap-5 ${bigNumbers.length > 4 ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
        {bigNumbers.map((item) => (
          <Panel key={item.label} className="!p-5">
            <p className="font-display text-4xl font-bold tabular-nums">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.label}</p>
            {item.note && <p className="mt-0.5 text-[11px] text-muted">{item.note}</p>}
          </Panel>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {/* Month by month */}
        <Panel>
          <Kicker>Month by month</Kicker>
          {stats.busiestMonth && (
            <p className="mt-2 text-lg">
              <span className="font-semibold">{stats.busiestMonth}</span> was the busiest month, with{" "}
              {stats.busiestCount} watched.
            </p>
          )}
          <div className="mt-6">
            <BarChart data={stats.perMonth} title={`Movies and shows watched per month in ${year}`} valueLabel="Watched" />
          </div>
        </Panel>

        {/* Ratings spread */}
        <Panel>
          <Kicker>How {isMe ? "you" : firstName} rated</Kicker>
          <p className="mt-2 text-lg">
            {Number(stats.average) >= 4
              ? "A generous critic: most of what you watched won you over."
              : Number(stats.average) >= 3
                ? "A fair critic: the good ones earned it."
                : "A tough critic: everything had to work for it."}
          </p>
          <div className="mt-6">
            <BarChart data={stats.ratingSpread} title={`Ratings given in ${year}, from half a star to five`} valueLabel="Rated" />
          </div>
          <p className="mt-1 text-center text-[10px] text-muted">stars</p>
        </Panel>
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-5">
        {/* Favourite */}
        {stats.favorite && (
          <Panel className="relative overflow-hidden">
            <Kicker>Favourite of the year</Kicker>
            <div className="mt-4">
              <MovieChip
                review={stats.favorite}
                caption={
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                    <StarIcon className="w-3.5 h-3.5" /> {Number(stats.favorite.rating)}
                  </span>
                }
              />
            </div>
            {stats.favorite.review && <p className="mt-4 text-soft leading-relaxed">“{stats.favorite.review}”</p>}
          </Panel>
        )}

        {/* Top genres */}
        {stats.topGenres.length > 0 && (
          <Panel>
            <Kicker>Top genres</Kicker>
            <ol className="mt-4 flex flex-col gap-3">
              {stats.topGenres.map((genre, index) => (
                <li key={genre.name} className="flex items-center gap-3">
                  <span className="w-5 text-right text-sm font-semibold text-muted tabular-nums">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{genre.name}</span>
                      <span className="text-muted tabular-nums">{genre.count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-fg/[0.06]">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${(genre.count / stats.topGenres[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Panel>
        )}
      </div>

      {/* Smaller moments */}
      <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
        {stats.first && (
          <Panel>
            <Kicker>First of the year</Kicker>
            <div className="mt-4">
              <MovieChip review={stats.first} caption={formatDay(stats.first.watched_on, { full: true })} />
            </div>
          </Panel>
        )}
        {stats.latest && stats.latest.id !== stats.first?.id && (
          <Panel>
            <Kicker>Most recent</Kicker>
            <div className="mt-4">
              <MovieChip review={stats.latest} caption={formatDay(stats.latest.watched_on, { full: true })} />
            </div>
          </Panel>
        )}
        {stats.oldest && (
          <Panel>
            <Kicker>Time capsule</Kicker>
            <div className="mt-4">
              <MovieChip review={stats.oldest} caption={`The oldest ${isShow(stats.oldest) ? "show" : "movie"} ${isMe ? "you" : firstName} watched, from ${releaseYear(stats.oldest.release_date)}`} />
            </div>
          </Panel>
        )}
        {stats.letdown && (
          <Panel>
            <Kicker>Biggest letdown</Kicker>
            <div className="mt-4">
              <MovieChip review={stats.letdown} caption={`Only ${Number(stats.letdown.rating)} ★`} />
            </div>
          </Panel>
        )}
        {stats.mostAgreed && (
          <Panel className="sm:col-span-2">
            <Kicker>Most agreed-with review</Kicker>
            <div className="mt-4">
              <MovieChip
                review={stats.mostAgreed.review}
                caption={`${stats.mostAgreed.agrees} ${stats.mostAgreed.agrees === 1 ? "person" : "people"} agreed`}
              />
            </div>
            {stats.mostAgreed.review.review && (
              <p className="mt-4 text-soft leading-relaxed">“{stats.mostAgreed.review.review}”</p>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
};

/* Fresh state for every person and year */
const YearInFilmRoute = () => {
  const { username, year } = useParams();
  return <YearInFilm key={`${username}-${year}`} />;
};

export default YearInFilmRoute;
