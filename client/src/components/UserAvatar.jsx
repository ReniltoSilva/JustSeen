import { avatarFor } from "../avatars";

/* An animal on its gradient, drawn as SVG so the emoji scales with any avatar size */
export const AnimalArt = ({ animal }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
    <defs>
      <linearGradient id={`avatar-${animal.id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={animal.from} />
        <stop offset="100%" stopColor={animal.to} />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill={`url(#avatar-${animal.id})`} />
    <text x="50" y="57" fontSize="72" textAnchor="middle" dominantBaseline="middle">
      {animal.emoji}
    </text>
  </svg>
);

/* The user's photo, chosen animal, or a default animal picked from their username */
const UserAvatar = ({ user, className = "w-10" }) => {
  const avatar = avatarFor(user);
  const label = user?.name || user?.username || "User";

  return (
    <div className="avatar">
      <div className={`${className} rounded-full overflow-hidden`} role="img" aria-label={label}>
        {avatar.type === "photo" ? (
          <img src={avatar.src} alt={label} />
        ) : (
          <AnimalArt animal={avatar.animal} />
        )}
      </div>
    </div>
  );
};

export default UserAvatar;
