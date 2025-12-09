import { createClient } from "@supabase/supabase-js";

const supabaseProjectUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseanonKey   = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseProjectUrl, supabaseanonKey);
