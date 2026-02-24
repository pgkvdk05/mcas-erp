"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { showSuccess, showError } from '@/utils/toast';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  userRole: 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            showError('Failed to load user role.');
            setUserRole(null);
            setLoading(false);
          } else if (profile) {
            setUserRole(profile.role as 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT');
            setLoading(false);
          } else {
            setUserRole(null);
            setLoading(false);
          }

          if (event === 'SIGNED_IN') {
            showSuccess('Logged in successfully!');
            if (profile?.role) {
              navigate(`/dashboard/${profile.role.toLowerCase().replace('_', '-')}`);
            } else {
              navigate('/dashboard/student');
            }
          }
        } else {
          setUserRole(null);
          if (event === 'SIGNED_OUT') {
            showSuccess('Logged out successfully!');
            navigate('/');
          }
          setLoading(false);
        }
      }
    );

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const initialSession = data?.session || null;
        setSession(initialSession);
        setUser(initialSession?.user || null);

        if (initialSession?.user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', initialSession.user.id)
            .single();

          if (error) {
            console.error('Error fetching initial user profile:', error);
            setUserRole(null);
          } else if (profile) {
            setUserRole(profile.role as 'SUPER_ADMIN' | 'ADMIN' | 'TEACHER' | 'STUDENT');
          } else {
            setUserRole(null);
          }
        } else {
          setUserRole(null);
        }
      } catch (err) {
        console.error('Error during initial session fetch:', err);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      try {
        authListener?.subscription?.unsubscribe();
      } catch (e) {
        // ignore unsubscribe errors
      }
    };
  }, [navigate]);

  return (
    <SessionContext.Provider value={{ session, user, userRole, loading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionContextProvider');
  }
  return context;
};