import { Link } from "react-router-dom";
import { avatarFor } from "../avatars";
import UserAvatar from "./UserAvatar";
import FollowButton from "./FollowButton";
import { PinIcon, UsersIcon } from "./icons";

/* The glow behind the avatar takes the avatar's own colour (purple for photos) */
const glowColor = (person) => {
  const avatar = avatarFor(person);
  return avatar.type === "animal" ? avatar.animal.from : "#7c5cff";
};

/* A quiet banner: neutral, a faint dot texture, and a soft glow only where the avatar sits */
const Banner = ({ person }) => (
  <div className="relative h-16 overflow-hidden bg-panel-2" aria-hidden="true">
    <div
      className="absolute inset-0 text-fg/[0.07]"
      style={{ backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)", backgroundSize: "12px 12px" }}
    />
    <div
      className="absolute inset-0 opacity-40 transition-opacity duration-300 group-hover:opacity-60"
      style={{ backgroundImage: `radial-gradient(circle at 15% 130%, ${glowColor(person)} 0%, transparent 55%)` }}
    />
  </div>
);

/* A person as a card; clicking anywhere opens their profile. `note` says why they're
suggested ("Followed by 2 people you follow", "You both watched Dune") */
const PersonCard = ({ person, reviewCount, note }) => (
  <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-panel transition duration-300 hover:border-line-strong hover:-translate-y-0.5 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)] has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand">
    {/* Banner with the avatar overlapping its bottom edge */}
    <Banner person={person} />

    <div className="px-5 pb-5 -mt-8">
      <div className="flex items-end justify-between gap-2">
        <div className="w-fit rounded-full ring-4 ring-panel">
          <UserAvatar user={person} className="w-16" />
        </div>
        {/* relative z-10 (inside FollowButton) lifts it above the card-wide link */}
        <FollowButton person={person} size="sm" />
      </div>

      {/* The link stretches over the whole card, so clicking anywhere opens the profile */}
      <h3 className="mt-3 text-lg font-bold text-fg truncate">
        <Link
          to={`/u/${person.username}`}
          className="focus:outline-none after:absolute after:inset-0 after:rounded-2xl"
        >
          {person.name}
        </Link>
      </h3>
      <p className="text-sm text-muted truncate">@{person.username}</p>

      {person.bio && <p className="text-sm text-soft mt-3 leading-relaxed">{person.bio}</p>}

      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-4 text-xs text-muted">
        {reviewCount !== undefined && (
          <span>
            <span className="font-semibold text-fg tabular-nums">{reviewCount}</span> watched
          </span>
        )}
        {person.location && (
          <span className="flex items-center gap-1">
            <PinIcon />
            {person.location}
          </span>
        )}
        {note && (
          <span className="flex items-center gap-1">
            <UsersIcon />
            {note}
          </span>
        )}
      </div>
    </div>
  </article>
);

export default PersonCard;
