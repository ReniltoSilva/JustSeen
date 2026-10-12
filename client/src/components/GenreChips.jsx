import { genreName } from "../genres";

/* Scrollable row of genre filters, "All" first */
const GenreChips = ({ genres, selected, onSelect }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 [scrollbar-width:none]">
    {["All", ...genres].map((genre) => {
      const active = selected === genre;
      return (
        <button
          key={genre}
          type="button"
          onClick={() => onSelect(genre)}
          aria-pressed={active}
          className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
            active
              ? "bg-brand border-brand text-white"
              : "bg-panel border-line text-soft hover:border-line-strong hover:text-fg"
          }`}
        >
          {genre === "All" ? "All" : genreName(genre)}
        </button>
      );
    })}
  </div>
);

export default GenreChips;
