import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { supabase } from '$lib/utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
  initialized: false
};

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>(initialState);

  return {
    subscribe,
    
    async initializeAuth() {
      if (!browser) return;
      
      try {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          set({
            user: session.user,
            session,
            loading: false,
            initialized: true
          });
        } else {
          set({
            user: null,
            session: null,
            loading: false,
            initialized: true
          });
        }
        
        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
          set({
            user: session?.user || null,
            session,
            loading: false,
            initialized: true
          });
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        set({
          user: null,
          session: null,
          loading: false,
          initialized: true
        });
      }
    },
    
    async signUp(email: string, password: string) {
      update(state => ({ ...state, loading: true }));
      
      console.log('🔐 signUp called with', { email });
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      console.log('🔐 signUp response', { data, error });
      
      if (error) {
        console.error('🔐 signUp error', error);
        update(state => ({ ...state, loading: false }));
        throw error;
      }
      
      if (data.user) {
        console.log('🔐 user created, inserting student_profiles row', data.user.id);
        
        // Generate and escrow key
        const { loadOrCreateUserKey } = await import('$lib/utils/encryption');
        await loadOrCreateUserKey(data.user.id, password);

        // Create user profile (aligned to actual schema)
        const { error: insertError } = await supabase.from('student_profiles').insert({
          user_id: data.user.id,
          full_name: email.split('@')[0],
          learner_type: 'Linear'
        });
        if (insertError) {
          console.error('🔐 student_profiles insert error', insertError);
          // Continue anyway; user is created in Supabase Auth
        } else {
          console.log('🔐 student_profiles row inserted');
        }
      }
      
      update(state => ({ 
        ...state, 
        loading: false,
        user: data.user,
        session: data.session
      }));
      
      return data;
    },
    
    async signIn(email: string, password: string) {
      // Auth uses Supabase signInWithPassword
      // Email confirmation disabled for development
      // Re-enable email confirmation for production
      update(state => ({ ...state, loading: true }));
      
      console.log('🔐 signIn called with', { email });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('🔐 signIn response', { data, error });
      
      if (error) {
        console.error('🔐 signIn error', error);
        update(state => ({ ...state, loading: false }));
        throw error;
      }

      if (data.user) {
        const { loadOrCreateUserKey } = await import('$lib/utils/encryption');
        await loadOrCreateUserKey(data.user.id, password);
      }
      
      update(state => ({ 
        ...state, 
        loading: false,
        user: data.user,
        session: data.session
      }));
      
      return data;
    },
    
    async signOut() {
      await supabase.auth.signOut();
      set(initialState);
    },
    
    // OAuth sign in
    // Google OAuth requires three redirect configurations
    // 1. Supabase dashboard Redirect URLs: localhost and production
    // 2. Google Cloud Console: Supabase auth callback URL
    // 3. This code: redirectTo points to /auth/callback route
    // Microsoft OAuth tenant set to 'common' in Supabase dashboard
    // allows both personal and organisational accounts
    async signInWithOAuth(provider: 'google' | 'azure') {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      return data;
    }
  };
}

export const authStore = createAuthStore();

// Derived stores for convenience
export const user = derived(authStore, $auth => $auth.user);
export const session = derived(authStore, $auth => $auth.session);
export const isAuthenticated = derived(authStore, $auth => !!$auth.user);
export const isLoading = derived(authStore, $auth => $auth.loading);
