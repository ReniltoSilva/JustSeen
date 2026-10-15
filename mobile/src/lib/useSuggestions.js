import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";
import { getSuggestions } from "../data/people";

/* "People you may know" (see shared/suggestions.js): null while loading, then a list of
{ profile, mutual, inCommon, sharedTitles }. Loaded once my library is ready, and not
again when I follow someone, so the person I just followed stays on screen showing
"Following" instead of vanishing */
export const useSuggestions = () => {
  const { user } = useAuth();
  const { ready, followingIds, myReviews } = useLibrary();
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    getSuggestions(user.id, [...followingIds], [...myReviews.values()])
      .then((found) => !cancelled && setSuggestions(found))
      .catch((error) => {
        console.error("Failed to load suggestions:", error);
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user.id]);

  return suggestions;
};
