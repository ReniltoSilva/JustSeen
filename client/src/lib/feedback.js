import { contactEmail } from "./site";

/* A mailto: link that opens the person's email app with a ready-to-fill bug report.
The technical details at the bottom help us find the problem; they can delete them */
export const feedbackLink = ({ user, error } = {}) => {
  const details = [
    `Page: ${window.location.href}`,
    user && `Account: @${user.username}`,
    `Browser: ${navigator.userAgent}`,
    error && `Error: ${error.message ?? error}`,
  ].filter(Boolean);

  const body = [
    error ? "What were you doing when this happened?" : "What happened (or what would you like to see)?",
    "",
    "",
    "--- Technical details (helps us fix it) ---",
    ...details,
  ].join("\n");

  const subject = error ? "JustSeen bug report" : "JustSeen feedback";
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
