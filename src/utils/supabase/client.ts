import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://wbeealitshckxjtfozsp.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiZWVhbGl0c2hja3hqdGZvenNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5NjM1NTcsImV4cCI6MjEwMzUzOTU1N30.pd8ZsKIIrDO-wp2ZOwok7A4ikZSVJ-p0GH3QffNvJuM";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
