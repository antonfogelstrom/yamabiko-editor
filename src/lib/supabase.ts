import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const SCHEMA = "yamabiko";
export const SCENES = "scenes";
export const BACKGROUNDS = "backgrounds";
export const MOODS = "moods";
export const PORTRAITS = "portraits";
export const NAMES = "names";
