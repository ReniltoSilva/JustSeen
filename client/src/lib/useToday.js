import { useSyncExternalStore } from "react";
import { localToday, msUntilTomorrow } from "./dates";

/* Today's date ("2026-10-14") that updates itself: at midnight, and when the tab is
looked at again (a tab left open for days would otherwise still say "today" on cards
from earlier in the week). One timer and one listener are shared by every card */
let today = localToday();
const listeners = new Set();
let timer = null;

const check = () => {
  const now = localToday();
  if (now !== today) {
    today = now;
    listeners.forEach((listener) => listener());
  }
};

const scheduleMidnight = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    check();
    scheduleMidnight();
  }, msUntilTomorrow() + 1000);
};

const onVisible = () => {
  if (document.visibilityState === "visible") {
    check();
    scheduleMidnight();
  }
};

const subscribe = (listener) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    check();
    scheduleMidnight();
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    }
  };
};

export const useToday = () => useSyncExternalStore(subscribe, () => today);
