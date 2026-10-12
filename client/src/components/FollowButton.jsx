import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLibrary } from "../library/LibraryContext";

/* Follow / Following toggle. Hovering "Following" offers to unfollow */
const FollowButton = ({ person, size = "md", className = "" }) => {
  const { user } = useAuth();
  const { isFollowing, toggleFollow } = useLibrary();
  const [busy, setBusy] = useState(false);

  if (!user || person.id === user.id) return null;
  const following = isFollowing(person.id);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      await toggleFollow(person.id);
    } catch (error) {
      console.error("Failed to update follow:", error);
    } finally {
      setBusy(false);
    }
  };

  const sizing = size === "sm" ? "px-3.5 py-1.5 text-xs" : "px-5 py-2 text-sm";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={following}
      className={`group/follow relative z-10 shrink-0 rounded-full font-semibold transition-colors disabled:opacity-60 ${sizing} ${
        following
          ? "bg-fg/[0.06] text-fg ring-1 ring-inset ring-line-strong hover:bg-disagree/10 hover:text-disagree hover:ring-disagree/30"
          : "bg-brand text-white hover:bg-brand-hover"
      } ${className}`}
    >
      {following ? (
        <>
          <span className="group-hover/follow:hidden">Following</span>
          <span className="hidden group-hover/follow:inline">Unfollow</span>
        </>
      ) : (
        "Follow"
      )}
    </button>
  );
};

export default FollowButton;
