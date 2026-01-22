// ============================================================================
// Admin Authentication Hook
// Manages admin/builder login state and role-based access control
// ============================================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'builder';

interface AdminAuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  isAdmin: boolean;
  isBuilder: boolean;
  hasAccess: boolean; // admin OR builder
  isLoading: boolean;
  error: string | null;
}

interface UseAdminAuthReturn extends AdminAuthState {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  checkRole: () => Promise<AppRole | null>;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    session: null,
    role: null,
    isAdmin: false,
    isBuilder: false,
    hasAccess: false,
    isLoading: true,
    error: null,
  });

  // Check user's role from user_roles table
  const checkRole = useCallback(async (): Promise<AppRole | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    try {
      // First check user_roles table (new RBAC system)
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!roleError && roleData?.role) {
        return roleData.role as AppRole;
      }

      // Fallback: check legacy admin_users table for backwards compatibility
      const { data: legacyData, error: legacyError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!legacyError && legacyData) {
        // User is in legacy admin_users table, treat as admin
        return 'admin';
      }

      return null;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('[useAdminAuth] Role check exception:', err);
      }
      return null;
    }
  }, []);

  // Update state based on role
  const updateStateWithRole = useCallback((role: AppRole | null) => {
    const isAdmin = role === 'admin';
    const isBuilder = role === 'builder';
    const hasAccess = isAdmin || isBuilder;
    
    setState(prev => ({
      ...prev,
      role,
      isAdmin,
      isBuilder,
      hasAccess,
      isLoading: false,
    }));
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

        // Defer role check to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const role = await checkRole();
            updateStateWithRole(role);
          }, 0);
        } else {
          updateStateWithRole(null);
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
        const role = await checkRole();
        updateStateWithRole(role);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [checkRole, updateStateWithRole]);

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
        const role = await checkRole();
        
        if (!role) {
          // Sign out if not authorized
          await supabase.auth.signOut();
          const errorMsg = 'Access restricted. You are not authorized to access the admin console.';
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            role: null,
            isAdmin: false,
            isBuilder: false,
            hasAccess: false,
            user: null,
            session: null,
            error: errorMsg,
          }));
          return { error: errorMsg };
        }

        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          role,
          isAdmin: role === 'admin',
          isBuilder: role === 'builder',
          hasAccess: true,
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

  const signUp = async (email: string, password: string): Promise<{ error: string | null }> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const redirectUrl = `${window.location.origin}/admin/pricing`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        setState(prev => ({ ...prev, isLoading: false, error: error.message }));
        return { error: error.message };
      }

      setState(prev => ({ ...prev, isLoading: false }));
      return { error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sign up failed';
      setState(prev => ({ ...prev, isLoading: false, error: errorMsg }));
      return { error: errorMsg };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setState({
      user: null,
      session: null,
      role: null,
      isAdmin: false,
      isBuilder: false,
      hasAccess: false,
      isLoading: false,
      error: null,
    });
  };

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    checkRole,
  };
}
