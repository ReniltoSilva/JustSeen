import { useSyncExternalStore } from "react";
import { AppState } from "react-native";
import { localToday, msUntilTomorrow } from "../../../shared/dates";

/* Today's date ("2026-10-14") that updates itself: at midnight, and when the app comes
back from the background (phones keep apps paused for days, so a feed drawn on Monday
would otherwise still say "today" on Wednesday). One timer and one listener are
shared by every screen that asks */
let today = localToday();
const listeners = new Set();
let timer = null;
let appState = null;

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

const subscribe = (listener) => {
  listeners.add(listener);
  if (listeners.size === 1) {
    check();
    scheduleMidnight();
    appState = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        check();
        scheduleMidnight();
      }
    });
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearTimeout(timer);
      appState?.remove();
    }
  };
};

export const useToday = () => useSyncExternalStore(subscribe, () => today);
