import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.warn(
    "Supabase env vars are missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). " +
    "Sighting submissions and map data won't be persisted until they're set."
  );
}

export const supabase = createClient(
  supabaseUrl ?? "https://placeholder.supabase.co",
  supabaseAnonKey ?? "placeholder-anon-key"
);

export type Sighting = {
  id: string;
  created_at: string;
  species: string;
  location_id: string;
  sighted_on: string;
  description: string | null;
  reporter_name: string | null;
  upvotes: number;
  last_confirmed_at: string;
};
