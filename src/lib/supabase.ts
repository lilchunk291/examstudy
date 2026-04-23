import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    const rawUrl = import.meta.env.VITE_SUPABASE_URL;
    const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Clean up the URL: remove quotes and whitespace
    let supabaseUrl = rawUrl ? rawUrl.replace(/['"]/g, '').trim() : '';
    const supabaseAnonKey = rawKey ? rawKey.replace(/['"]/g, '').trim() : '';

    // Function to check if a string is a valid URL
    const isValidUrl = (url: string) => {
      try {
        const u = new URL(url);
        return u.protocol === 'http:' || u.protocol === 'https:';
      } catch {
        return false;
      }
    };

    // Remote fallback (your project)
    const remoteFallbackUrl = 'https://bxtcoslcgepyfjnsiciz.supabase.co';
    const remoteFallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4dGNvc2xjZ2VweWZqbnNpY2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NzIwNTMsImV4cCI6MjA4NjA0ODA1M30.QvIo_Z2IQ2Z5pAEWh3sd8eTXTYJ2GL4xwYjYWQ7vNcU';

    let finalUrl = '';
    let finalKey = '';

    if (isValidUrl(supabaseUrl) && supabaseAnonKey) {
      finalUrl = supabaseUrl;
      finalKey = supabaseAnonKey;
    } else {
      // Always fallback to the remote project if env vars are missing/invalid
      finalUrl = remoteFallbackUrl;
      finalKey = remoteFallbackKey;
      console.warn("Supabase environment variables missing or invalid. Using remote project fallback.");
    }

    try {
      supabaseInstance = createClient(finalUrl, finalKey);
    } catch (err: any) {
      console.error("Failed to initialize Supabase client:", err.message);
      throw new Error(`Supabase Initialization Error: ${err.message}. URL was: "${finalUrl}"`);
    }
  }
  return supabaseInstance;
}
