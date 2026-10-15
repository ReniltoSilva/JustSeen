import { titleKey } from "./titles.js";

/* "People you may know", worked out the same way on the website and in the app.
Two reasons to suggest someone, and people with both come first:
- friends of friends: people followed by the people I follow (`mutual` of them)
- same taste: people who reviewed the same movies and shows as me (`inCommon`), with
  the ones we rated alike (half a star apart or closer) counting double
Plain functions; the apps fetch the rows (data/people.js, data/follows.js) */

/* friendFollows: [{ following_id, profile }] rows of who my follows follow.
sameTitleReviews: [{ user_id, media_type, movie_id, title, rating, author }] other people's
reviews of titles I reviewed. myReviews: my own reviews ({ media_type, movie_id, rating }) */
export const rankSuggestions = ({ myId, followingIds, friendFollows = [], sameTitleReviews = [], myReviews = [], limit = 12 }) => {
  const skip = new Set([myId, ...followingIds]);
  const mine = new Map(myReviews.map((review) => [titleKey(review), review]));
  const people = new Map();
  const entryFor = (profile) => {
    if (!people.has(profile.id)) people.set(profile.id, { profile, mutual: 0, inCommon: 0, alike: 0, sharedTitles: [] });
    return people.get(profile.id);
  };

  for (const row of friendFollows) {
    if (!row.profile || skip.has(row.following_id)) continue;
    entryFor(row.profile).mutual += 1;
  }

  for (const review of sameTitleReviews) {
    const myReview = mine.get(titleKey(review));
    if (!review.author || !myReview || skip.has(review.user_id)) continue;
    const entry = entryFor(review.author);
    entry.inCommon += 1;
    if (Math.abs(Number(review.rating) - Number(myReview.rating)) <= 0.5) entry.alike += 1;
    entry.sharedTitles.push(review.title);
  }

  const score = (entry) => entry.mutual * 3 + entry.inCommon + entry.alike;
  return [...people.values()].sort((a, b) => score(b) - score(a)).slice(0, limit);
};

/* Why someone is suggested, in a few words */
export const suggestionNote = ({ mutual = 0, inCommon = 0, sharedTitles = [] }) => {
  const friends = mutual > 0 ? `Followed by ${mutual} ${mutual === 1 ? "person" : "people"} you follow` : null;
  if (friends && inCommon > 0) return `${friends} · ${inCommon} in common`;
  if (friends) return friends;
  if (inCommon === 1) return `You both watched ${sharedTitles[0]}`;
  if (inCommon > 1) return `You both watched ${sharedTitles[0]} and ${inCommon - 1} more`;
  return "New on JustSeen";
};
