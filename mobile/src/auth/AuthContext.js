import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

/* Same messages as the website (client/src/auth/AuthContext.jsx) */
const friendlyError = (error) => {
  const message = error?.message ?? String(error);
  if (/invalid login credentials/i.test(message)) return "Wrong email or password.";
  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first. Check your inbox for the link we sent.";
  }
  if (/rate limit/i.test(message)) return "Too many attempts. Please wait a minute and try again.";
  if (/network|fetch/i.test(message)) return "Can't reach JustSeen. Check your connection and try again.";
  return message;
};

/* session = the login, user = my profile row (username, name, avatar...) */
export const AuthProvider = ({ children }) => {
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
      const { data } = await supabase.from("profiles").select("*").eq("id", newSession.user.id).maybeSingle();
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

  const logout = () => supabase.auth.signOut();

  return <AuthContext.Provider value={{ session, user, loading, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
