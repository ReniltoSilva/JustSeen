import * as Sentry from "@sentry/react";

/* Crash reports go to Sentry, but only when a DSN is set (Netlify's VITE_SENTRY_DSN),
so local development and forks stay silent. Reports carry the error, the page and the
browser; never names, emails or screen recordings */
const dsn = import.meta.env.VITE_SENTRY_DSN;

export const initMonitoring = () => {
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    /* Only errors: no performance tracing, no session replays */
    tracesSampleRate: 0,
  });
};

/* For errors we catch ourselves (the error boundary), so they still get reported */
export const reportError = (error, componentStack) => {
  if (!dsn) return;
  Sentry.captureException(error, { contexts: { react: { componentStack } } });
};

/* Tag reports with the account's id (not name or email), so we can tell whether one
person or many are affected */
export const setMonitoredUser = (id) => {
  if (!dsn) return;
  Sentry.setUser(id ? { id } : null);
};
