import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { passwordProblem } from "../auth/passwords";
import PasswordInput from "../components/PasswordInput";

const inputClass =
  "w-full h-12 rounded-xl bg-ink border border-line px-4 text-[15px] text-fg transition focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

/* Opened from the "reset your password" email. The link logs the person in
temporarily, so all that's left is choosing a new password */
const ResetPassword = () => {
  const { session, loading, changePassword } = useAuth();
  const navigate = useNavigate();
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
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

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
