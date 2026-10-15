import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { passwordProblem } from "../auth/passwords";
import PasswordInput from "../components/PasswordInput";
import { authInputClass as inputClass } from "../components/formStyles";
import { CheckIcon } from "../components/icons";
import { usePageMeta } from "../lib/usePageMeta";

/* Opened from the "reset your password" email. The link logs the person in
temporarily, so all that's left is choosing a new password.
When the mobile app asked for the email, the link carries ?app=<the app's address>:
then this page doesn't continue in the browser, but sends the person back to the app
(through /app-auth, which only opens the JustSeen app) to log in there */
const ResetPassword = () => {
  usePageMeta({ title: "Choose a new password" });
  const { session, loading, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const appUrl = searchParams.get("app");
  const [done, setDone] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    const problem = passwordProblem(password, { email: session?.user?.email ?? "" });
    if (problem) return setError(problem);
    if (password !== confirm) return setError("The two passwords don't match.");

    setSaving(true);
    try {
      await changePassword(password);
      if (!appUrl) return navigate("/", { replace: true });
      /* The password is for the app: leave this browser logged out */
      setDone(true);
      await logout().catch(() => {});
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-400/15 text-emerald-400">
          <CheckIcon className="h-7 w-7" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Password changed</h1>
        <p className="mt-2 text-soft">Go back to the JustSeen app and log in with your new password.</p>
        <a
          href={`/app-auth?to=${encodeURIComponent(appUrl)}`}
          className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Open the JustSeen app
        </a>
      </div>
    );
  }

  if (loading) return null;

  if (!session) {
    return (
      <div className="mx-auto max-w-sm px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">This link has expired</h1>
        <p className="mt-2 text-soft">Reset links only work once and for a limited time.</p>
        <Link
          to="/login?mode=forgot"
          className="mt-6 inline-block rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white"
        >
          Send a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[26rem] px-5 py-16 sm:py-24">
      <h1 className="text-3xl font-bold tracking-tight">Choose a new password</h1>
      <p className="mt-2 text-soft">Make it something you don't use anywhere else.</p>
      <form onSubmit={save} className="mt-7 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">New password</span>
          <PasswordInput
            value={password}
            onChange={setPassword}
            showRules
            autoComplete="new-password"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Repeat it</span>
          <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" className={inputClass} />
        </div>
        {error && (
          <p className="rounded-xl bg-disagree/10 px-4 py-3 text-sm text-disagree ring-1 ring-disagree/25" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="h-12 rounded-xl bg-brand font-semibold text-white shadow-lg shadow-brand/25 hover:bg-brand-hover disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save password"}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
