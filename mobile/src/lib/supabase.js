/* Gives Supabase a localStorage to keep the login in, stored with SQLite on the phone */
import "expo-sqlite/localStorage/install";
import { AppState } from "react-native";
import { createClient } from "@supabase/supabase-js";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error("Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Copy mobile/.env.example to mobile/.env.");
}

/* The same Supabase project as the website, so the same accounts, reviews and rules */
export const supabase = createClient(url, key, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    /* Phones have no address bar to read a login from */
    detectSessionInUrl: false,
  },
});

/* Keep the login fresh only while the app is on screen */
AppState.addEventListener("change", (state) => {
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

/* Supabase returns { data, error }; this turns an error into a thrown one */
export const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};
