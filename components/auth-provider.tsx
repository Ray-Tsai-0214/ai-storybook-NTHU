"use client";

import React, { createContext, useContext } from "react";
import { useSession } from "@/lib/auth-client";
import type { User, Session } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { data: session, isPending: isLoading } = useSession();

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        session: session || null,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}