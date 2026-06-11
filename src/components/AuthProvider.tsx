"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthRegisterInput, AuthSessionUser, AuthSignInInput } from "@/lib/auth-types";

type AuthContextValue = {
  isReady: boolean;
  currentUser: AuthSessionUser | null;
  isAuthenticated: boolean;
  signIn: (input: AuthSignInInput) => Promise<AuthSessionUser>;
  register: (input: AuthRegisterInput) => Promise<AuthSessionUser>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readSession() {
  const response = await fetch("/api/auth/me", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as { user?: AuthSessionUser | null } | null;
  return payload?.user ?? null;
}

async function postAuth<TInput extends Record<string, string>>(path: string, input: TInput) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => null)) as { user?: AuthSessionUser; error?: string } | null;

  if (!response.ok || !payload?.user) {
    throw new Error(payload?.error ?? "操作失败，请稍后再试。");
  }

  return payload.user;
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [currentUser, setCurrentUser] = useState<AuthSessionUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const user = await readSession();

        if (!cancelled) {
          setCurrentUser(user);
        }
      } finally {
        if (!cancelled) {
          setIsReady(true);
        }
      }
    }

    hydrate();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (input: AuthSignInInput) => {
    const user = await postAuth("/api/auth/login", input);
    setCurrentUser(user);
    return user;
  }, []);

  const register = useCallback(async (input: AuthRegisterInput) => {
    const user = await postAuth("/api/auth/register", input);
    setCurrentUser(user);
    return user;
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    setCurrentUser(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      isReady,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      signIn,
      register,
      signOut,
    }),
    [currentUser, isReady, register, signIn, signOut],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
