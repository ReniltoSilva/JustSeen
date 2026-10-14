import { createContext, useContext, useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import { supabase } from "../lib/supabase";
import { siteUrl } from "../lib/site";
import { isUsernameAvailable, updateProfile as saveProfile } from "../data/people";
import { removeAllSharePictures } from "../data/reviews";
import { cleanUsername, usernameProblem } from "../../../shared/usernames";
import { passwordProblem } from "../../../shared/passwords";

const AuthContext = createContext(null);

/* Same messages as the website (client/src/auth/AuthContext.jsx) */
const friendlyError = (error) => {
  const message = error?.message ?? String(error);
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first. Check your inbox for the link we sent.";
  }
  if (/already registered|already exists/i.test(message)) {
    return "There's already an account with that email. Try logging in.";
  }
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait a minute and try again.";
  if (/network|fetch/i.test(message)) return "Can't reach JustSeen. Check your connection and try again.";
  return message;
};

/* Where Google sends people back to: this app (exp://... in Expo Go, justseen:// in
the real app). Supabase only allows addresses listed under Authentication ->
URL Configuration -> Redirect URLs */
const redirectTo = makeRedirectUri();

/* session = the login, user = my profile row (username, name, avatar...) */
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* The login and the profile are saved together, after the profile arrives, so the
    screens never see a login without a profile (the feed needs user.id) */
    const loadProfile = async (newSession) => {
      if (!newSession) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("*").eq("id", newSession.user.id).maybeSingle();
      setSession(newSession);
      setUser(data ? { ...data, email: newSession.user.email } : null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));

    /* Supabase asks not to await its other calls inside this callback, so the
    profile load waits for the next tick */
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setTimeout(() => loadProfile(newSession), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(friendlyError(error));
  };

  /* Returns true when the account needs its email confirmed before logging in */
  const signup = async ({ email, password, name, username, avatar }) => {
    const cleanName = cleanUsername(username);
    const problem = usernameProblem(cleanName);
    if (problem) throw new Error(problem);
    const weakPassword = passwordProblem(password, { email, username: cleanName });
    if (weakPassword) throw new Error(weakPassword);
    if (!name.trim()) throw new Error("Please enter your name.");
    if (!(await isUsernameAvailable(cleanName))) throw new Error("That username is already taken.");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        /* The database copies these into the new profile (see handle_new_user) */
        data: { username: cleanName, name: name.trim(), avatar },
        /* The confirmation link opens the website, which says the account is ready */
        emailRedirectTo: siteUrl,
      },
    });
    if (error) throw new Error(friendlyError(error));
    return !data.session;
  };

  /* Google's sign-in page opens in a secure browser window inside the app. When it's
  done, Google sends the login back in the address, and Supabase takes it from there.
  New Google accounts see the welcome step first (see the tabs layout) */
  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw new Error(friendlyError(error));

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== "success") return; // closed the window

    const { params, errorCode } = QueryParams.getQueryParams(result.url);
    if (errorCode || params.error) throw new Error(params.error_description || "Google sign-in didn't work. Please try again.");
    if (!params.access_token) return;
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: params.access_token,
      refresh_token: params.refresh_token,
    });
    if (sessionError) throw new Error(friendlyError(sessionError));
  };

  const logout = () => supabase.auth.signOut();

  /* The reset link opens the website's "choose a new password" page */
  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${siteUrl}/reset-password`,
    });
    if (error) throw new Error(friendlyError(error));
  };

  /* { name, username, bio, location, avatar, needs_setup } */
  const updateProfile = async (changes) => {
    const update = { ...changes };
    if ("name" in update) {
      update.name = update.name.trim();
      if (!update.name) throw new Error("Your name can't be empty.");
    }
    if ("username" in update) {
      update.username = cleanUsername(update.username);
      const problem = usernameProblem(update.username);
      if (problem) throw new Error(problem);
      if (update.username !== user.username && !(await isUsernameAvailable(update.username))) {
        throw new Error("That username is already taken.");
      }
    }
    for (const field of ["bio", "location"]) {
      if (field in update) update[field] = update[field].trim();
    }

    /* Everything else points at my id, not my username, so renaming is just this one update */
    const saved = await saveProfile(user.id, update);
    setUser({ ...saved, email: user.email });
    return saved;
  };

  /* Deletes the login and, through the database's cascades, everything that belonged to it */
  const deleteAccount = async () => {
    /* Shared-review pictures live in file storage, which the database cascade can't reach */
    await removeAllSharePictures(user.id).catch((err) => console.error("Failed to remove share pictures:", err));
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw new Error(friendlyError(error));
    /* The session is gone on the server; clear it here too */
    await supabase.auth.signOut({ scope: "local" });
  };

  return (
    <AuthContext.Provider
      value={{ session, user, loading, login, signup, signInWithGoogle, logout, sendPasswordReset, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
