import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { getNotifications, markAllRead, subscribeToNotifications } from "../data/notifications";

/* My notifications (follows and reactions), kept up to date by Supabase Realtime the
moment they happen, like the website's bell. The Activity tab shows them and its
badge shows how many are unread */
const NotificationsContext = createContext(null);

export const NotificationsProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifications, setNotifications] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(
    () =>
      getNotifications()
        .then((list) => {
          setNotifications(list);
          setLoaded(true);
        })
        .catch((error) => console.error("Failed to load notifications:", error)),
    [],
  );

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoaded(false);
      return;
    }
    load();
    /* Any change to my notifications: reload the list (it's small) */
    return subscribeToNotifications(userId, load);
  }, [userId, load]);

  const unread = notifications.filter((item) => !item.read).length;

  /* Looking at the list counts as reading it */
  const markRead = useCallback(async () => {
    if (!userId || !notifications.some((item) => !item.read)) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    try {
      await markAllRead(userId);
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  }, [userId, notifications]);

  const value = useMemo(() => ({ notifications, loaded, unread, markRead, reload: load }), [notifications, loaded, unread, markRead, load]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};

export const useNotifications = () => useContext(NotificationsContext);
