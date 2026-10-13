import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getFollowers, getFollowing, getSuggestions } from "../data/follows";
import { searchProfiles } from "../data/profiles";
import { getReviewCounts } from "../data/reviews";
import ProfileHeader from "../components/ProfileHeader";
import PageHeading from "../components/PageHeading";
import Masonry from "../components/Masonry";
import PersonCard from "../components/PersonCard";
import EmptyState from "../components/EmptyState";
import { SearchIcon } from "../components/icons";
import { usePageMeta } from "../lib/usePageMeta";

const tabs = [
  { key: "following", label: "Following" },
  { key: "followers", label: "Followers" },
  { key: "find", label: "Find people" },
];

/* Waits until typing pauses before searching, instead of on every key */
const useDebounced = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const PeopleGrid = ({ people, counts, mutual = {} }) => (
  <Masonry
    items={people}
    getKey={(person) => person.id}
    maxColumns={4}
    narrowOnPhone={false}
    renderItem={(person) => (
      <PersonCard person={person} reviewCount={counts[person.id]} mutualCount={mutual[person.id]} />
    )}
  />
);

/* Who I follow, who follows me, and finding new people */
const People = () => {
  usePageMeta({ title: "People" });
  const { user } = useAuth();
  const { followingIds, version } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "following";

  const [following, setFollowing] = useState(null);
  const [followers, setFollowers] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [found, setFound] = useState({ term: "", list: [] });
  const [counts, setCounts] = useState({});
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query);

  /* Following and followers lists. Re-run when I follow or unfollow someone */
  useEffect(() => {
    let cancelled = false;
    Promise.all([getFollowing(user.id), getFollowers(user.id)])
      .then(([followingList, followerList]) => {
        if (cancelled) return;
        setFollowing(followingList);
        setFollowers(followerList);
      })
      .catch((error) => console.error("Failed to load people:", error));
    return () => {
      cancelled = true;
    };
  }, [user.id, version]);

  /* Suggestions are based on who I follow, so only the ids matter */
  const followingKey = [...followingIds].sort().join(",");
  useEffect(() => {
    let cancelled = false;
    getSuggestions(user.id, followingKey.split(",").filter(Boolean))
      .then((list) => !cancelled && setSuggestions(list))
      .catch((error) => console.error("Failed to load suggestions:", error));
    return () => {
      cancelled = true;
    };
  }, [user.id, followingKey]);

  /* Search by name or username; results are kept per query */
  const searchTerm = debouncedQuery.trim();
  useEffect(() => {
    if (!searchTerm) return;
    let cancelled = false;
    searchProfiles(searchTerm, { excludeId: user.id })
      .then((list) => !cancelled && setFound({ term: searchTerm, list }))
      .catch((error) => console.error("People search failed:", error));
    return () => {
      cancelled = true;
    };
  }, [searchTerm, user.id]);

  /* No search typed means no results to show (worked out here, not stored) */
  const results = searchTerm && found.term === searchTerm ? found.list : null;

  /* "N watched" on every card shown, fetched in one go */
  const shownPeople = [
    ...(following ?? []),
    ...(followers ?? []),
    ...suggestions.map((item) => item.profile),
    ...(results ?? []),
  ];
  const peopleKey = [...new Set(shownPeople.map((person) => person.id))].sort().join(",");
  useEffect(() => {
    if (!peopleKey) return;
    let cancelled = false;
    getReviewCounts(peopleKey.split(","))
      .then((result) => !cancelled && setCounts(result))
      .catch((error) => console.error("Failed to count reviews:", error));
    return () => {
      cancelled = true;
    };
  }, [peopleKey]);

  const chooseTab = (key) => setSearchParams(key === "following" ? {} : { tab: key }, { replace: true });
  const mutual = Object.fromEntries(suggestions.map((item) => [item.profile.id, item.mutual]));

  const tabCounts = { following: following?.length, followers: followers?.length };

  return (
    <div className="min-h-screen px-4 md:px-8 py-6 md:py-8">
      <ProfileHeader />

      <section className="max-w-7xl mx-auto pt-8 pb-6">
        <PageHeading title="People" subtitle="Follow people to see their reviews in your feed." />

        <div className="flex gap-6 mt-5 border-b border-line overflow-x-auto [scrollbar-width:none]" role="tablist">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => chooseTab(key)}
              className={`relative shrink-0 pb-3 text-base font-semibold transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full ${
                tab === key ? "text-fg after:bg-brand" : "text-muted hover:text-fg after:bg-transparent"
              }`}
            >
              {label}
              {tabCounts[key] !== undefined && (
                <span className="ml-1.5 text-sm font-medium text-muted">{tabCounts[key]}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto pb-16">
        {tab === "following" &&
          following &&
          (following.length === 0 ? (
            <EmptyState
              emoji="🧭"
              title="You're not following anyone yet"
              message="Find friends by name or username, and their reviews will show up in your feed."
              actions={[{ to: "/people?tab=find", label: "Find people" }]}
            />
          ) : (
            <PeopleGrid people={following} counts={counts} />
          ))}

        {tab === "followers" &&
          followers &&
          (followers.length === 0 ? (
            <EmptyState
              emoji="🌱"
              title="No followers yet"
              message="Share your profile with friends. When someone follows you, you'll get a notification."
            />
          ) : (
            <PeopleGrid people={followers} counts={counts} />
          ))}

        {tab === "find" && (
          <div className="flex flex-col gap-8">
            <div className="relative max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none">
                <SearchIcon />
              </span>
              <input
                type="search"
                autoFocus
                placeholder="Search by name or username..."
                aria-label="Search people"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 rounded-full bg-panel border border-line pl-11 pr-4 text-sm text-fg placeholder:text-muted focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/25"
              />
            </div>

            {results !== null &&
              (results.length === 0 ? (
                <p className="text-muted">Nobody matches “{debouncedQuery}”.</p>
              ) : (
                <PeopleGrid people={results} counts={counts} mutual={mutual} />
              ))}

            {results === null && suggestions.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4">People you may know</h2>
                <PeopleGrid
                  people={suggestions.map((item) => item.profile)}
                  counts={counts}
                  mutual={mutual}
                />
              </div>
            )}

            {results === null && suggestions.length === 0 && (
              <p className="text-sm text-muted">
                Type a name or username to find someone. Once you follow a few people, we'll suggest more.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default People;
