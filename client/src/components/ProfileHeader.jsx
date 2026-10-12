import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getFollowCounts } from "../data/follows";
import { genreName } from "../genres";
import UserAvatar from "./UserAvatar";
import EditProfileModal from "./EditProfileModal";
import FollowButton from "./FollowButton";
import { PencilIcon, PinIcon, SparklesIcon } from "./icons";

/* Genre that shows up most across the reviews */
const favoriteGenre = (reviews) => {
  const counts = new Map();
  for (const review of reviews) {
    for (const id of review.genre_ids ?? []) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return top ? genreName(top[0]) : null;
};

const averageRating = (reviews) => {
  if (reviews.length === 0) return null;
  const total = reviews.reduce((sum, review) => sum + Number(review.rating), 0);
  return (total / reviews.length).toFixed(1);
};

/*
  The profile card at the top of a page.
  `profile` is whose card it is; `reviews` are their reviews (any shape with
  rating and genre_ids). Leave both out for my own card.
*/
const ProfileHeader = ({ profile, reviews }) => {
  const { user } = useAuth();
  const { myReviews, version } = useLibrary();
  const [editing, setEditing] = useState(false);
  const [counts, setCounts] = useState(null);

  /* My own card always uses the logged-in user, so edits show up straight away */
  const isMe = !profile || profile.id === user?.id;
  const person = isMe ? user : profile;
  const theirReviews = isMe ? [...myReviews.values()] : reviews ?? [];
  const personId = person?.id;

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;
    getFollowCounts(personId)
      .then((result) => !cancelled && setCounts(result))
      .catch((error) => console.error("Failed to load follow counts:", error));
    return () => {
      cancelled = true;
    };
  }, [personId, version]);

  if (!person) return null;

  /* On a profile page the name is the page title; elsewhere the page has its own */
  const Heading = profile ? "h1" : "h2";
  const avg = averageRating(theirReviews);
  const favorite = favoriteGenre(theirReviews);
  const year = new Date().getFullYear();

  const stats = [
    { label: "Watched", value: theirReviews.length },
    { label: "Avg rating", value: avg ? `★ ${avg}` : "—" },
    { label: "Followers", value: counts?.followers ?? "·" },
    { label: "Following", value: counts?.following ?? "·" },
  ];

  return (
    <section className="relative max-w-7xl mx-auto overflow-hidden rounded-3xl border border-line bg-panel">
      {/* Soft purple glow behind the profile */}
      <div className="absolute -top-24 -left-16 w-80 h-80 rounded-full bg-brand/20 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 md:p-8">
        <div className="flex items-start gap-5 min-w-0">
          <UserAvatar
            user={person}
            className="w-20 h-20 shrink-0 ring-2 ring-brand ring-offset-4 ring-offset-panel"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <Heading className="text-2xl font-bold text-fg truncate">{person.name}</Heading>
              {isMe ? (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  title="Edit profile"
                  aria-label="Edit profile"
                  className="grid place-items-center w-8 h-8 shrink-0 rounded-full text-muted hover:text-fg hover:bg-fg/10 transition-colors"
                >
                  <PencilIcon />
                </button>
              ) : (
                <FollowButton person={person} size="sm" />
              )}
            </div>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted">
              <span>@{person.username}</span>
              {person.location && (
                <span className="flex items-center gap-1">
                  <PinIcon />
                  {person.location}
                </span>
              )}
            </p>
            {person.bio && <p className="text-sm text-soft mt-1.5">{person.bio}</p>}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {favorite && (
                <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-medium text-brand-soft">
                  Loves {favorite}
                </span>
              )}
              <Link
                to={`/u/${person.username}/year/${year}`}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
              >
                <SparklesIcon className="w-3.5 h-3.5" />
                {isMe ? "Your" : `${person.name.split(" ")[0]}'s`} {year} in film
              </Link>
            </div>
          </div>
        </div>

        {/* Equal tiles that grow taller instead of cutting text off */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-ink/60 border border-line px-2 sm:px-4 py-3 text-center sm:min-w-24"
            >
              <span className="text-base sm:text-xl md:text-2xl font-bold leading-tight text-fg tabular-nums">
                {stat.value}
              </span>
              <span className="text-[10px] sm:text-[11px] leading-tight tracking-wider text-muted uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {editing && <EditProfileModal onClose={() => setEditing(false)} />}
    </section>
  );
};

export default ProfileHeader;
