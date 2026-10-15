import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getNotifications, markAllRead, subscribeToNotifications } from "../data/notifications";
import { posterUrl } from "../lib/tmdb";
import { timeAgo } from "../lib/dates";
import { titlePath } from "../lib/titles";
import UserAvatar from "./UserAvatar";
import { BellIcon } from "./icons";

const reactionText = {
  agree: { verb: "agreed with", className: "text-agree" },
  unsure: { verb: "isn't sure about", className: "text-unsure" },
  disagree: { verb: "disagreed with", className: "text-disagree" },
};

/* What one notification says, and where tapping it goes */
const describe = (item) => {
  if (item.type === "follow") {
    return { to: `/u/${item.actor?.username}`, text: <>started following you</> };
  }
  const reaction = reactionText[item.reaction] ?? reactionText.agree;
  return {
    to: item.review ? titlePath(item.review) : "/watched",
    text: (
      <>
        <span className={reaction.className}>{reaction.verb}</span> your review of{" "}
        <span className="font-medium text-fg">{item.review?.title ?? "a movie"}</span>
      </>
    ),
  };
};

/* Bell in the header. Supabase Realtime pushes new notifications the moment they happen */
const NotificationBell = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const load = () =>
      getNotifications()
        .then((list) => !cancelled && setNotifications(list))
        .catch((error) => console.error("Failed to load notifications:", error));

    load();
    /* Any change to my notifications: reload the list (it's small) */
    const unsubscribe = subscribeToNotifications(userId, load);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [userId]);

  const unread = notifications.filter((item) => !item.read);

  /* Opening the list counts as reading it */
  const openList = async () => {
    if (unread.length === 0) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllRead(userId);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const closeMenu = () => document.activeElement?.blur();

  return (
    <div className="dropdown dropdown-end shrink-0">
      <div
        tabIndex={0}
        role="button"
        aria-label={unread.length ? `Notifications, ${unread.length} new` : "Notifications"}
        onFocus={openList}
        className="relative grid place-items-center w-9 h-9 rounded-full text-soft hover:text-fg hover:bg-fg/5 transition-colors cursor-pointer"
      >
        <BellIcon />
        {unread.length > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-disagree text-[10px] font-bold leading-4 text-white text-center">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </div>

      <div
        tabIndex={0}
        className="dropdown-content z-50 mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-panel shadow-2xl overflow-hidden"
      >
        <p className="px-4 py-3 text-sm font-semibold text-fg border-b border-line">Notifications</p>

        {notifications.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted">
            Nothing yet. When people follow you or react to your reviews, you'll see it here.
          </p>
        ) : (
          <ul className="max-h-96 overflow-y-auto">
            {notifications.map((item) => {
              const { to, text } = describe(item);
              const poster = posterUrl(item.review?.poster_path, "w92");
              return (
                <li key={item.id}>
                  <Link
                    to={to}
                    onClick={closeMenu}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-fg/[0.03] transition-colors"
                  >
                    <UserAvatar user={item.actor} className="w-9" />
                    <p className="flex-1 min-w-0 text-sm leading-snug text-soft">
                      <span className="font-semibold text-fg">{item.actor?.name ?? "Someone"}</span> {text}
                      <span className="block mt-0.5 text-xs text-muted">{timeAgo(item.created_at)}</span>
                    </p>
                    {poster && (
                      <img src={poster} alt="" className="w-8 aspect-[2/3] rounded object-cover shrink-0" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;
