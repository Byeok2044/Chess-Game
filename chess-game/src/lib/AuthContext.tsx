import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from './supabase.ts';
import { getOrFetch, appCache } from './cache.ts';

export interface SignUpResult {
  error: string | null;
  needsEmailConfirmation: boolean;
}

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_TTL_MS = 60000;

function extractErrorMessage(error: unknown): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (typeof error === 'string') return error;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'object') {
    const anyErr = error as Record<string, unknown>;
    if (typeof anyErr.message === 'string' && anyErr.message) return anyErr.message;
    if (typeof anyErr.error_description === 'string') return anyErr.error_description;
    if (typeof anyErr.msg === 'string') return anyErr.msg;
  }
  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setProfile(null);
      return;
    }
    const userId = session.user.id;
    getOrFetch(`profile:${userId}`, PROFILE_TTL_MS, async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (error) throw error;
      return data as Profile;
    })
      .then(setProfile)
      .catch((error) => {
        console.error('Failed to load profile:', error);
        setProfile(null);
      });
  }, [session?.user?.id]);

  async function signUp(email: string, password: string, username: string): Promise<SignUpResult> {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return { error: 'Please choose a username.', needsEmailConfirmation: false };

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: trimmedUsername } },
    });

    if (error) {
      console.error('Sign up error:', error);
      const message = extractErrorMessage(error);
      if (/duplicate key|already exists|unique/i.test(message)) {
        return { error: 'That email is already registered.', needsEmailConfirmation: false };
      }
      return { error: message, needsEmailConfirmation: false };
    }

    const needsEmailConfirmation = !!data.user && !data.session;
    return { error: null, needsEmailConfirmation };
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Sign in error:', error);
      return extractErrorMessage(error);
    }
    return null;
  }

  async function signOut() {
    if (session?.user) appCache.invalidate(`profile:${session.user.id}`);
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}