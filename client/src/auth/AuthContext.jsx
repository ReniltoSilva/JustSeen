import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { isUsernameAvailable, updateProfile as saveProfile } from "../data/profiles";
import { cleanUsername, usernameProblem } from "./usernames";
import { passwordProblem } from "./passwords";

const AuthContext = createContext(null);

/* Turns Supabase's messages into friendlier ones */
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
  return message;
};

export const AuthProvider = ({ children }) => {
  /* session = the login (from Supabase Auth), user = my profile row */
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async (newSession) => {
      setSession(newSession);
      if (!newSession) {
        setUser(null);
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", newSession.user.id)
        .maybeSingle();
      setUser(data ? { ...data, email: newSession.user.email } : null);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => loadProfile(data.session));

    /* Fires on login, logout, token refresh and password-recovery links.
    Supabase asks not to await other Supabase calls inside this callback,
    so the profile load is pushed to the next tick */
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
    if (!(await isUsernameAvailable(cleanName))) throw new Error("That username is already taken.");

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        /* The database copies these into the new profile (see handle_new_user) */
        data: { username: cleanName, name: name.trim(), avatar },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) throw new Error(friendlyError(error));
    return !data.session;
  };

  const logout = () => supabase.auth.signOut();

  const sendPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(friendlyError(error));
  };

  const changePassword = async (password) => {
    const weakPassword = passwordProblem(password, { email: session?.user?.email ?? "" });
    if (weakPassword) throw new Error(weakPassword);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(friendlyError(error));
  };

  /* { name, username, bio, location, avatar } */
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
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw new Error(friendlyError(error));
    /* The session is gone on the server; clear it here too */
    await supabase.auth.signOut({ scope: "local" });
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        login,
        signup,
        logout,
        sendPasswordReset,
        changePassword,
        updateProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
