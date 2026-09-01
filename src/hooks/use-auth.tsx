import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null; session?: Session | null }>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<{
    error: string | null;
    needsEmailConfirmation?: boolean;
    session?: Session | null;
  }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfileAndRole = React.useCallback(async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
      }
      if (roleRes.data) {
        const hasAdminRole = roleRes.data.some((r) => r.role === "admin");
        setIsAdmin(hasAdminRole);
      }
    } catch (err) {
      console.error("[Auth] Failed to load user profile or role:", err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1. Initial session hydration
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession } }) => {
        if (!mounted) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchProfileAndRole(initialSession.user.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("[Auth] Error getting initial session:", err);
        if (mounted) setLoading(false);
      });

    // 2. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!mounted) return;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchProfileAndRole(currentSession.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfileAndRole]);

  const login = React.useCallback(
    async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: error.message };
      }
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) {
          await fetchProfileAndRole(data.user.id);
        }
      }
      return { error: null, session: data.session };
    },
    [fetchProfileAndRole],
  );

  const register = React.useCallback(
    async (fullName: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { error: error.message, needsEmailConfirmation: false };
      }

      const needsEmailConfirmation = !data.session && Boolean(data.user);
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
        if (data.user) {
          await fetchProfileAndRole(data.user.id);
        }
      }

      return { error: null, needsEmailConfirmation, session: data.session };
    },
    [fetchProfileAndRole],
  );

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (user?.id) {
      await fetchProfileAndRole(user.id);
    }
  }, [user?.id, fetchProfileAndRole]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      profile,
      isAdmin,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }),
    [user, session, profile, isAdmin, loading, login, register, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
