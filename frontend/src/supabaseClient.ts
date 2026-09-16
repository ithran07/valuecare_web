import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase is only used here for OPTIONAL customer accounts (sign up / log
// in / order history). Product and order DATA always goes through the
// Django API in api.ts, never straight from the browser to the database.
// If you haven't set up Supabase Auth yet, `supabase` is simply null and
// the site works fully as a guest-checkout storefront.
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
