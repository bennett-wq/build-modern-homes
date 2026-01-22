// ============================================================================
// Admin Authentication Hook
// Manages admin login state and access control
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

interface UseAdminAuthReturn extends AdminAuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  // Check if the current user is an admin
  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.warn('[useAdminAuth] Admin check error:', error.message);
        }
        return false;
      }

      return !!data;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[useAdminAuth] Admin check exception:', err);
      }
      return false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer admin check to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const isAdmin = await checkAdminStatus();
            setState(prev => ({ ...prev, isAdmin, isLoading: false }));
          }, 0);
        } else {
          setState(prev => ({ ...prev, isAdmin: false, isLoading: false }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        const isAdmin = await checkAdminStatus();
        setState(prev => ({ ...prev, isAdmin, isLoading: false }));
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminStatus]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        return { error: error.message };
      }

      if (data.user) {
        const isAdmin = await checkAdminStatus();
        
        if (!isAdmin) {
          // Sign out if not an admin
          await supabase.auth.signOut();
          const errorMsg = 'Access restricted. You are not authorized to access the admin console.';
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            isAdmin: false,
            user: null,
            session: null,
            error: errorMsg,
          }));
          return { error: errorMsg };
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          isAdmin: true,
          user: data.user,
          session: data.session,
        }));
        return { error: null };
      }

      return { error: 'Login failed' };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      return { error: errorMsg };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      isAdmin: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    signIn,
    signOut,
    checkAdminStatus,
  };
}
