import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { LogoMark } from "../components/Logo";
import { contactEmail } from "../lib/site";
import { usePageMeta } from "../lib/usePageMeta";

/* "November 13, 2026": the day the account is deleted for good, 30 days after asking */
const deletionDay = (requestedAt) =>
  new Date(Date.parse(requestedAt) + 30 * 86_400_000).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

/* Shown instead of the app while an account waits to be deleted: right after asking,
and whenever the person logs in during the 30 days */
const RestoreAccount = () => {
  usePageMeta({ title: "Account scheduled for deletion" });
  const { user, restoreAccount, logout } = useAuth();
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState("");
  const day = deletionDay(user.deletion_requested_at);
  /* Asked in the last few minutes: this is the confirmation, not a return visit */
  const [openedAt] = useState(() => Date.now());
  const justAsked = openedAt - Date.parse(user.deletion_requested_at) < 5 * 60_000;

  const restore = async () => {
    setError("");
    setRestoring(true);
    try {
      await restoreAccount();
    } catch (err) {
      setError(err.message || "Couldn't restore your account. Please try again.");
      setRestoring(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[26rem]">
        <LogoMark className="h-9 w-auto" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          {justAsked ? "Your account will be deleted" : "Welcome back"}
        </h1>
        <p className="mt-3 leading-relaxed text-soft">
          {justAsked ? "Your account is now hidden from everyone." : `@${user.username} is scheduled for deletion.`} It will be
          deleted for good on <strong className="text-fg">{day}</strong>, together with your reviews, watchlist, follows and
          reactions.
        </p>
        <p className="mt-3 leading-relaxed text-soft">
          {justAsked
            ? `We've emailed you a confirmation. Changed your mind? Log in any time before ${day} and restore it.`
            : "Changed your mind? Restore it and everything will be just as you left it."}
        </p>

        {error && (
          <p className="mt-5 rounded-xl bg-disagree/10 px-4 py-3 text-sm text-disagree ring-1 ring-disagree/25" role="alert">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={restore}
            disabled={restoring}
            className="h-12 rounded-xl bg-brand text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-60"
          >
            {restoring ? "One moment..." : "Restore my account"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="h-12 rounded-xl text-[15px] font-semibold text-fg ring-1 ring-line-strong transition hover:bg-fg/5"
          >
            Log out
          </button>
        </div>

        <p className="mt-6 text-xs text-muted">
          Questions about your data? Write to{" "}
          <a href={`mailto:${contactEmail}`} className="text-brand-soft hover:underline">
            {contactEmail}
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default RestoreAccount;
