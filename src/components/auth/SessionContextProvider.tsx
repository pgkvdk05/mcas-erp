"use client";

import React, { createContext, useEffect, useRef, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

export interface SessionContextType {
  session: Session | null;
  user: User | null;
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
  loading: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const navigateRef = useRef(navigate);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (!mounted) return null;
      if (error) {
        console.error('Error fetching user profile:', error);
        showError('Failed to load user role.');
        return null;
      }
      return profile?.role as 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const role = await fetchRole(currentSession.user.id);
          if (!mounted) return;
          setUserRole(role);
          setLoading(false);

          if (event === 'SIGNED_IN') {
            showSuccess('Logged in successfully!');
            const path = role
              ? role === "SUPER_ADMIN" ? "/dashboard/admin" : `/dashboard/${role.toLowerCase().replace("_", "-")}`
              : '/dashboard/student';
            navigateRef.current(path);
          }
        } else {
          setUserRole(null);
          setLoading(false);
          if (event === 'SIGNED_OUT') {
            showSuccess('Logged out successfully!');
            navigateRef.current('/');
          }
        }
      }
    );

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 8000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, userRole, loading }}>
      {children}
    </SessionContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export { useSession } from './useSession';
