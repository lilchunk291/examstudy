import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    // Use the user's specific project URL by default, fallback to env var if needed
    let supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
      supabaseUrl = 'https://bxtcoslcgepyfjnsiciz.supabase.co';
    }
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      throw new Error(
        'Missing Supabase Anon Key. Please set VITE_SUPABASE_ANON_KEY in your AI Studio Secrets.'
      );
    }

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}
