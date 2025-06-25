"use client";

import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { authClient } from "@/lib/auth-client";
import type { User, Session } from "@/lib/auth";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initialize: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  subscribeWithSelector((set, get) => ({
    // State
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,

    // Actions
    setUser: (user) => set({ user }),
    setSession: (session) => set({ session, user: session?.user || null }),
    setLoading: (isLoading) => set({ isLoading }),
    setInitialized: (isInitialized) => set({ isInitialized }),

    initialize: async () => {
      if (get().isInitialized) return;
      
      set({ isLoading: true });
      
      try {
        const session = await authClient.getSession();
        set({
          session: session.data || null,
          user: session.data?.user || null,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Failed to initialize auth:", error);
        set({
          session: null,
          user: null,
          isLoading: false,
          isInitialized: true,
        });
      }
    },

    signOut: async () => {
      try {
        await authClient.signOut();
        set({
          user: null,
          session: null,
          isLoading: false,
        });
      } catch (error) {
        console.error("Sign out error:", error);
      }
    },

    refreshSession: async () => {
      try {
        const session = await authClient.getSession();
        set({
          session: session.data || null,
          user: session.data?.user || null,
        });
      } catch (error) {
        console.error("Failed to refresh session:", error);
        set({
          session: null,
          user: null,
        });
      }
    },
  }))
);

// Selectors for better performance
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const signOut = useAuthStore((state) => state.signOut);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  return {
    user,
    session,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    signOut,
    refreshSession,
  };
};

// Hook to initialize auth on app startup
export const useInitAuth = () => {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  return { initialize, isInitialized };
};