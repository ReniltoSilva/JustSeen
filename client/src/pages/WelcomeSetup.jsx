import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import AvatarPicker from "../components/AvatarPicker";
import { LogoMark } from "../components/Logo";

const inputClass =
  "w-full h-12 rounded-xl bg-ink border border-line px-4 text-[15px] text-fg placeholder:text-muted transition focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

/* Shown once, after someone's first Google sign-in. The database already gave them a
username from their email, so everything is filled in; they just confirm or change it */
const WelcomeSetup = () => {
  const { user, updateProfile, logout } = useAuth();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [avatar, setAvatar] = useState(user.avatar);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      /* Once needs_setup is false, RequireAuth shows the app instead of this page */
      await updateProfile({ name, username, avatar, needs_setup: false });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-10">
      <div className="w-full max-w-[26rem]">
        <LogoMark className="h-9 w-auto" />
        <h1 className="mt-6 text-3xl font-bold tracking-tight">Welcome to JustSeen</h1>
        <p className="mt-2 text-soft">Choose how your friends will see you. You can change this later.</p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">Name</span>
            <input
              type="text"
              className={inputClass}
              required
              maxLength={40}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-fg">Username</span>
            <input
              type="text"
              className={inputClass}
              required
              maxLength={21}
              autoComplete="username"
              autoCapitalize="none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <span className="text-xs text-muted">Friends find you with this. Letters, numbers, dots and underscores.</span>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-fg">Pick an avatar</span>
            <AvatarPicker value={avatar} onChange={setAvatar} />
          </div>

          {error && (
            <p className="rounded-xl bg-disagree/10 px-4 py-3 text-sm text-disagree ring-1 ring-disagree/25" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="h-12 rounded-xl bg-brand text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-60"
          >
            {saving ? "One moment..." : "Start using JustSeen"}
          </button>
          <button type="button" onClick={logout} className="text-sm font-medium text-soft hover:text-fg">
            Not you? Log out
          </button>
        </form>
      </div>
    </div>
  );
};

export default WelcomeSetup;
