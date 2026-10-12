import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Copy client/.env.example to client/.env and fill them in.",
  );
}

/* One shared client for the whole app. It keeps the login session in the
browser and refreshes it automatically */
export const supabase = createClient(url, key);

/* Supabase returns { data, error }; this turns an error into a thrown one
so callers can use plain try/catch */
export const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};
