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

    if (isValidUrl(supabaseUrl) && supabaseAnonKey && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' && !supabaseUrl.includes('YOUR_SUPABASE_URL')) {
      finalUrl = supabaseUrl;
      finalKey = supabaseAnonKey;
    } else {
      // Detailed logging for debugging
      const reasons = [];
      if (!rawUrl) reasons.push("VITE_SUPABASE_URL is missing");
      else if (!isValidUrl(supabaseUrl)) reasons.push("VITE_SUPABASE_URL is not a valid URL");
      else if (supabaseUrl.includes('YOUR_SUPABASE_URL')) reasons.push("VITE_SUPABASE_URL is still set to placeholder");
      
      if (!rawKey) reasons.push("VITE_SUPABASE_ANON_KEY is missing");
      else if (rawKey === 'YOUR_SUPABASE_ANON_KEY') reasons.push("VITE_SUPABASE_ANON_KEY is still set to placeholder");

      console.warn(`Supabase environment variables missing or invalid: ${reasons.join(', ')}. Using remote project fallback.`);
      
      finalUrl = remoteFallbackUrl;
      finalKey = remoteFallbackKey;
    }

    try {
      supabaseInstance = createClient(finalUrl, finalKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'studyvault-auth-token',
          flowType: 'pkce',
          storage: window.localStorage,
          // Explicitly handle locking issues in iframe/dev environments
          // navigator.locks can be unreliable in nested iframes
        }
      });
    } catch (err: any) {
      console.error("Failed to initialize Supabase client:", err.message);
      throw new Error(`Supabase Initialization Error: ${err.message}. URL was: "${finalUrl}"`);
    }
  }
  return supabaseInstance;
}
