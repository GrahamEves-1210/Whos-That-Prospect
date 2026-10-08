import type { Session } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  username: string;
}

const USERNAME_RE = /^[A-Za-z0-9_.-]{3,24}$/;

/** Email + password auth and the signed-in user's profile. Inert when Supabase isn't configured. */
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ready, setReady] = useState(!supabase);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id ?? null;

  useEffect(() => {
    if (!supabase || !userId) {
      setProfile(null);
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setProfile(data as Profile);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    if (!supabase) return 'Accounts are not set up yet.';
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  /** Returns an error message, or null. `needsConfirm` is true when the project requires email confirmation. */
  const signUp = useCallback(async (email: string, password: string): Promise<{ error: string | null; needsConfirm: boolean }> => {
    if (!supabase) return { error: 'Accounts are not set up yet.', needsConfirm: false };
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message, needsConfirm: false };
    return { error: null, needsConfirm: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
  }, []);

  const updateUsername = useCallback(
    async (username: string): Promise<string | null> => {
      if (!supabase || !userId) return 'Not signed in.';
      const name = username.trim();
      if (!USERNAME_RE.test(name)) return 'Use 3 to 24 letters, numbers, dots, dashes or underscores.';
      const { error } = await supabase.from('profiles').update({ username: name }).eq('id', userId);
      if (error) return error.code === '23505' ? 'That username is taken.' : error.message;
      setProfile({ id: userId, username: name });
      return null;
    },
    [userId],
  );

  return {
    enabled: !!supabase,
    ready,
    email: session?.user.email ?? null,
    userId,
    profile,
    signIn,
    signUp,
    signOut,
    updateUsername,
  };
}

export type UseAuth = ReturnType<typeof useAuth>;
