import UserAvatar from "./UserAvatar";
import { BookmarkIcon, EyeIcon, NeutralIcon, StarIcon, StarPlusIcon, ThumbDownIcon, ThumbUpIcon } from "./icons";

/* Example reviews for the welcome page, drawn like the real cards inside the app.
Illustrative only: the people are made up, the posters come from TMDB */
const examples = [
  {
    person: { name: "Maya", username: "maya", avatar: "animal:fox" },
    when: "yesterday",
    title: "Dune: Part Two",
    year: 2024,
    poster: "/6izwz7rsy95ARzTR3poZ8H6c5pp.jpg",
    genres: ["Sci-Fi", "Adventure"],
    rating: 5,
    review: "Saw it on the biggest screen I could find. Worth every minute.",
    reactions: [12, 1, 0],
  },
  {
    person: { name: "Leo", username: "leo", avatar: "animal:owl" },
    when: "Sunday",
    title: "Coyote vs. Acme",
    year: 2026,
    poster: "/kYDCl2y0VPvhT5eYWbMRInPoB03.jpg",
    genres: ["Comedy", "Family"],
    rating: 4,
    review: "Laughed the whole way through. Perfect with the kids.",
    reactions: [7, 0, 1],
  },
  {
    person: { name: "Sofia", username: "sofia", avatar: "animal:penguin" },
    when: "Oct 4",
    title: "Runner",
    year: 2026,
    poster: "/yBKMAIj7clP42UkFejhGDBBoTpb.jpg",
    genres: ["Action", "Comedy"],
    rating: 3.5,
    review: "Silly fun. Turn your brain off and enjoy the chases.",
    reactions: [4, 2, 1],
  },
];

/* Same layout as MovieCard, with fixed dark colours since this panel is always dark */
const ExampleCard = ({ example, className = "" }) => (
  <article
    className={`absolute w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#131318] text-left shadow-2xl shadow-black/50 ${className}`}
  >
    <div className="flex items-center gap-2 border-b border-white/5 px-2.5 py-2">
      <span className="rounded-full ring-2 ring-white/10">
        <UserAvatar user={example.person} className="w-7" />
      </span>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-xs font-semibold text-white">{example.person.name}</p>
        <p className="flex items-center gap-1 whitespace-nowrap text-[10px] text-white/50">
          <EyeIcon className="w-3 h-3" />
          Watched {example.when}
        </p>
      </div>
    </div>

    <div className="relative aspect-[4/5]">
      <img
        src={`https://image.tmdb.org/t/p/w342${example.poster}`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#131318] to-transparent" />
      <div className="absolute right-1.5 top-1.5 flex flex-col rounded-full bg-black/45 p-0.5 ring-1 ring-white/15 backdrop-blur-md">
        <span className="grid h-6 w-6 place-items-center text-white">
          <StarPlusIcon className="w-3 h-3" />
        </span>
        <span className="grid h-6 w-6 place-items-center text-white">
          <BookmarkIcon className="w-3 h-3" />
        </span>
      </div>
    </div>

    <div className="px-2.5 pb-2.5 pt-1.5">
      <div className="flex items-start justify-between gap-1.5">
        <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-white">{example.title}</p>
        <span className="flex shrink-0 items-center gap-1.5 pt-0.5 text-[10px] tabular-nums">
          <span className="flex items-center gap-0.5 font-semibold text-amber-400">
            <StarIcon className="w-2.5 h-2.5" />
            {example.rating}
          </span>
          <span className="text-white/50">{example.year}</span>
        </span>
      </div>
      <ul className="mt-1.5 flex gap-1">
        {example.genres.map((genre) => (
          <li key={genre} className="rounded-full px-1.5 py-px text-[9px] font-medium text-white/70 ring-1 ring-inset ring-white/10">
            {genre}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[11px] leading-snug text-white/75">{example.review}</p>
      <div className="mt-2.5 flex items-center justify-center gap-3 border-t border-white/5 pt-2 text-[10px] font-medium tabular-nums">
        <span className="flex items-center gap-1 text-emerald-400">
          <ThumbUpIcon className="w-3 h-3" />
          {example.reactions[0]}
        </span>
        <span className="flex items-center gap-1 text-[#a1a1b5]">
          <NeutralIcon className="w-3 h-3" />
          {example.reactions[1]}
        </span>
        <span className="flex items-center gap-1 text-rose-400">
          <ThumbDownIcon className="w-3 h-3" />
          {example.reactions[2]}
        </span>
      </div>
    </div>
  </article>
);

/* Three example cards, fanned out like a hand of cards */
const LoginShowcase = () => (
  <div className="relative h-[31rem] w-[27rem]" aria-hidden="true">
    <ExampleCard example={examples[1]} className="left-0 top-8 -rotate-[9deg] opacity-80" />
    <ExampleCard example={examples[2]} className="right-0 top-12 rotate-[9deg] opacity-80" />
    <ExampleCard example={examples[0]} className="left-1/2 top-0 -translate-x-1/2" />
  </div>
);

export default LoginShowcase;
