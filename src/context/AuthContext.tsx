import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type RoleCode = 'REQUESTER' | 'APPROVER' | 'PROCUREMENT' | 'ADMIN';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  department_id: string | null;
  role_code: RoleCode;
  is_active: boolean;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean; // auth bootstrap only
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (!nextSession?.user) {
        setProfile(null);
        setProfileLoading(false);
      }
    };

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (!active) return;

        if (error) {
          console.error('Auth bootstrap error:', error.message);
          applySession(null);
        } else {
          applySession(data.session ?? null);
        }
      } catch (err) {
        console.error('Unexpected auth bootstrap error:', err);
        if (!active) return;
        applySession(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    bootstrap();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      try {
        setProfileLoading(true);

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, department_id, role_code, is_active')
          .eq('id', user.id)
          .maybeSingle();

        if (!active) return;

        if (error) {
          console.error('Profile fetch error:', error.message);
          setProfile(null);
        } else {
          setProfile((data as Profile | null) ?? null);
        }
      } catch (err) {
        console.error('Unexpected profile fetch error:', err);
        if (!active) return;
        setProfile(null);
      } finally {
        if (active) setProfileLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: 'Unexpected error during login' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setProfileLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      profileLoading,
      signIn,
      signOut,
    }),
    [session, user, profile, loading, profileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}