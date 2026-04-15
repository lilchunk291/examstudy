import { useEffect } from "react";
import { getSupabase } from "../../lib/supabase";

export default function AuthCallback() {
  useEffect(() => {
    // Supabase automatically handles the hash fragment or query params 
    // and saves the session to local storage when the client initializes.
    // We just need to wait a brief moment for that to complete, then notify the parent.
    
    const completeAuth = async () => {
      try {
        const supabase = getSupabase();
        // Force session refresh/check to ensure it's saved
        await supabase.auth.getSession();
        
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
          window.close();
        } else {
          // Fallback if not opened in a popup
          window.location.href = '/app';
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        if (window.opener) {
          window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR' }, '*');
          window.close();
        }
      }
    };

    completeAuth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
        <p className="text-slate-500 font-bold tracking-tight">Completing authentication...</p>
      </div>
    </div>
  );
}
