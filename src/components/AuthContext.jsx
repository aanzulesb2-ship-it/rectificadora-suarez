"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from '@/lib/supabase';

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
  error: null,
  signIn: async () => false,
  signOut: async () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRole = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (error) return null;
    return data?.role ?? null;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user ?? null;

    if (sessionError || !sessionUser) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }

    setUser(sessionUser);

    let userRole = sessionUser.user_metadata?.role ?? null;
    if (!userRole) userRole = await fetchRole(sessionUser.id);

    setRole(userRole);
    setLoading(false);
  }, [fetchRole]);

  useEffect(() => {
    refresh();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });
    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, [refresh]);

  const signIn = useCallback(
    async (email, password) => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      const loggedUser = data?.user ?? null;
      setUser(loggedUser);

      let userRole = loggedUser?.user_metadata?.role ?? null;
      if (!userRole && loggedUser?.id) userRole = await fetchRole(loggedUser.id);

      setRole(userRole);
      setLoading(false);
      return true;
    },
    [fetchRole]
  );

  const signOut = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);

    setUser(null);
    setRole(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, error, signIn, signOut, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

