import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { cleanUsername, usernameProblem } from "../auth/usernames";
import { passwordProblem } from "../auth/passwords";
import AvatarPicker from "../components/AvatarPicker";
import PasswordInput from "../components/PasswordInput";
import LoginShowcase from "../components/LoginShowcase";
import ThemeToggle from "../components/ThemeToggle";
import { LogoMark } from "../components/Logo";
import { GoogleIcon } from "../components/icons";
import { animalAvatars, animalValue } from "../avatars";

const inputClass =
  "w-full h-12 rounded-xl bg-ink border border-line px-4 text-[15px] text-fg placeholder:text-muted transition focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/15";

const Field = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-sm font-medium text-fg">{label}</span>
    {children}
    {hint && <span className="text-xs text-muted">{hint}</span>}
  </label>
);

/* What makes JustSeen different, in three lines */
const promises = [
  { emoji: "✍️", title: "Share what you watched", text: "A star rating and a few honest words. That's a review." },
  { emoji: "👀", title: "See what friends are watching", text: "Your feed is the people you follow, not a database." },
  { emoji: "🍿", title: "Pick your next movie", text: "Trust friends' taste over critic scores." },
];

const copy = {
  login: { title: "Welcome back", subtitle: "Log in to see what your friends have been watching." },
  signup: { title: "Join your friends on JustSeen", subtitle: "Free, simple, and takes less than a minute." },
  forgot: { title: "Reset your password", subtitle: "Enter your email and we'll send you a link." },
};

/* Log in, sign up and "forgot password" on one page (?mode=signup / ?mode=forgot) */
const Login = () => {
  const { user, login, signup, signInWithGoogle, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = copy[searchParams.get("mode")] ? searchParams.get("mode") : "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState(animalValue(animalAvatars[0]));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Already logged in (or just did): go where they were heading */
  if (user) return <Navigate to={location.state?.from || "/"} replace />;

  const switchMode = (next) => {
    setError("");
    setNotice("");
    setSearchParams(next === "login" ? {} : { mode: next }, { replace: true, state: location.state });
  };

  /* Phone buttons in the welcome section: pick the tab and scroll down to the form */
  const jumpToForm = (next) => {
    switchMode(next);
    document.getElementById("login-form")?.scrollIntoView({ behavior: "smooth" });
  };

  /* Off to Google; on success the browser comes back already logged in */
  const handleGoogle = async () => {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await signInWithGoogle(location.state?.from || "/");
    } catch (err) {
      setError(err.message || "Couldn't reach Google. Please try again.");
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (mode === "signup") {
      const problem =
        usernameProblem(cleanUsername(username)) ||
        passwordProblem(password, { email, username: cleanUsername(username) });
      if (problem) return setError(problem);
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
        navigate(location.state?.from || "/", { replace: true });
      } else if (mode === "signup") {
        const needsConfirmation = await signup({ email, password, name, username, avatar });
        if (needsConfirmation) {
          setNotice(`Almost there! We sent a confirmation link to ${email.trim()}. Open it to activate your account, then log in.`);
          setPassword("");
          setSearchParams({}, { replace: true, state: location.state });
        }
      } else {
        await sendPasswordReset(email);
        setNotice(`If ${email.trim()} has an account, a link to reset the password is on its way.`);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const { title, subtitle } = copy[mode];

  return (
    <div className="relative min-h-screen lg:grid lg:grid-cols-[1.1fr_1fr]">
      {/* Light / dark switch, top right on every screen size */}
      <ThemeToggle className="absolute right-4 top-4 z-20 sm:right-6 sm:top-6" />

      {/* The story: always dark, whatever the theme, like a cinema.
      Phones see it first, with buttons that jump to the form */}
      <section className="relative flex flex-col justify-between gap-8 overflow-hidden bg-[#0b0a14] px-5 pt-6 pb-10 text-white sm:px-10 lg:px-12 lg:py-10 xl:px-16">
        <div className="absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-[#7c5cff]/30 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-3xl" />

        <div className="relative flex items-center gap-2.5">
          <LogoMark className="h-8 w-auto" />
          <span className="font-display text-2xl font-bold tracking-tight">JustSeen</span>
        </div>

        {/* Wide screens: headline on the left, cards beside it at full size.
        Everywhere else: cards under the headline, scaled to fit */}
        <div className="relative 2xl:flex 2xl:items-center 2xl:justify-between 2xl:gap-6">
          <div className="2xl:max-w-sm">
            <h2 className="font-display text-4xl sm:text-5xl [@media(min-height:961px)]:xl:text-6xl font-bold leading-[1.05] tracking-tight">
              Movies are better
              <br />
              <span className="bg-gradient-to-r from-[#b4a3ff] to-fuchsia-400 bg-clip-text text-transparent">
                with friends.
              </span>
            </h2>
            <p className="mt-4 max-w-md text-base sm:text-lg leading-relaxed text-white/70 lg:mt-5">
              Share quick reviews of what you watch, and decide what to see next from the people whose taste you
              trust. No critic scores. Just your friends.
            </p>

            {/* Phones: jump straight to the form */}
            <div className="mt-6 flex flex-wrap gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => jumpToForm("signup")}
                className="rounded-xl bg-[#7c5cff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/30 hover:bg-[#6a48f5]"
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => jumpToForm("login")}
                className="rounded-xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/15 hover:bg-white/15"
              >
                I have an account
              </button>
            </div>
          </div>

          {/* The fan is 27rem wide and 31rem tall at full size; each screen size
          scales it down and reserves only the height it needs */}
          <div
            className="mt-8 flex justify-center h-[21rem] sm:max-lg:h-[28rem]
              lg:max-2xl:h-[20rem] lg:max-2xl:[@media(min-height:961px)_and_(max-height:1080px)]:h-[24rem] lg:max-2xl:[@media(min-height:1081px)]:h-[31rem]
              2xl:mt-0 2xl:h-[31rem] 2xl:shrink-0"
          >
            <div
              className="origin-top scale-[0.68] sm:max-lg:scale-[0.9]
                lg:max-2xl:scale-[0.64] lg:max-2xl:[@media(min-height:961px)_and_(max-height:1080px)]:scale-[0.76] lg:max-2xl:[@media(min-height:1081px)]:scale-100
                2xl:scale-100"
            >
              <LoginShowcase />
            </div>
          </div>
        </div>

        <ul className="relative hidden lg:grid grid-cols-3 gap-6">
          {promises.map((item) => (
            <li key={item.title}>
              <span className="text-xl">{item.emoji}</span>
              <p className="mt-2 text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-white/55">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* The form */}
      <section id="login-form" className="flex scroll-mt-4 flex-col px-5 py-8 sm:px-10 lg:py-10">
        <div className="flex flex-1 items-center justify-center py-4 lg:py-8">
          <div className="w-full max-w-[26rem]">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-2 text-soft">{subtitle}</p>

            {mode !== "forgot" && (
              <div className="mt-7 grid grid-cols-2 rounded-xl bg-fg/[0.09] p-1 text-sm font-semibold ring-1 ring-inset ring-fg/[0.04]" role="tablist">
                {[
                  { label: "Log in", value: "login" },
                  { label: "Create account", value: "signup" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={mode === tab.value}
                    onClick={() => switchMode(tab.value)}
                    className={`rounded-lg py-2.5 transition ${
                      mode === tab.value
                        ? "bg-panel text-fg shadow-md shadow-black/10 ring-1 ring-line dark:bg-fg/[0.14] dark:ring-fg/10"
                        : "text-muted hover:bg-fg/[0.04] hover:text-fg"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {notice && (
              <p className="mt-6 rounded-xl bg-agree/10 px-4 py-3 text-sm leading-relaxed text-fg ring-1 ring-agree/30" role="status">
                {notice}
              </p>
            )}

            {mode !== "forgot" && (
              <>
                <button
                  type="button"
                  onClick={handleGoogle}
                  disabled={submitting}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-panel text-[15px] font-semibold text-fg ring-1 ring-line-strong transition hover:bg-fg/[0.04] disabled:opacity-60"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                <div className="mt-6 flex items-center gap-3 text-xs font-medium text-muted">
                  <span className="h-px flex-1 bg-line" />
                  or with email
                  <span className="h-px flex-1 bg-line" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className={`${mode === "forgot" ? "mt-7" : "mt-5"} flex flex-col gap-5`}>
              {mode === "signup" && (
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Name">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Alex Rivera"
                      required
                      maxLength={40}
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Field>
                  <Field label="Username">
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="alexcinema"
                      required
                      maxLength={21}
                      autoComplete="username"
                      autoCapitalize="none"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </Field>
                </div>
              )}

              <Field label="Email">
                <input
                  type="email"
                  className={inputClass}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              {mode !== "forgot" && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-fg">Password</span>
                    {mode === "login" && (
                      <button
                        type="button"
                        onClick={() => switchMode("forgot")}
                        className="text-xs font-semibold text-brand-soft hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <PasswordInput
                    value={password}
                    onChange={setPassword}
                    showRules={mode === "signup"}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    className={inputClass}
                  />
                </div>
              )}

              {mode === "signup" && (
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-fg">Pick an avatar</span>
                  <AvatarPicker value={avatar} onChange={setAvatar} />
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-disagree/10 px-4 py-3 text-sm text-disagree ring-1 ring-disagree/25" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-12 rounded-xl bg-brand text-[15px] font-semibold text-white shadow-lg shadow-brand/25 transition hover:bg-brand-hover disabled:opacity-60"
              >
                {submitting
                  ? "One moment..."
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Log in"}
              </button>

              {mode === "forgot" && (
                <button type="button" onClick={() => switchMode("login")} className="text-sm font-medium text-soft hover:text-fg">
                  ← Back to log in
                </button>
              )}
            </form>
          </div>
        </div>

        {/* On phones the left panel is hidden, so the three promises sit under the form */}
        <ul className="lg:hidden mx-auto grid w-full max-w-[26rem] gap-4 border-t border-line pt-6">
          {promises.map((item) => (
            <li key={item.title} className="flex gap-3">
              <span className="text-xl">{item.emoji}</span>
              <div>
                <p className="text-sm font-semibold text-fg">{item.title}</p>
                <p className="text-xs text-muted">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-muted">
          Movie data and posters from{" "}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer" className="underline hover:text-fg">
            TMDB
          </a>
          . JustSeen uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </section>
    </div>
  );
};

export default Login;
