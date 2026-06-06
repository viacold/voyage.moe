"use client";

import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ThemeId } from "@/content/site";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  isTransitioning: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeId(theme: string | undefined): theme is ThemeId {
  return theme === "clear" || theme === "voyage" || theme === "night" || theme === "archive";
}

function readDocumentTheme(): ThemeId {
  const theme = document.documentElement.dataset.theme;
  return isThemeId(theme) ? theme : "clear";
}

function applyDocumentTheme(theme: ThemeId) {
  document.documentElement.dataset.theme = theme;
  document.body.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "night" ? "dark" : "light";
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<ThemeId>("clear");
  const [isHydrated, setIsHydrated] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
      settleTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    setThemeState(readDocumentTheme());
    setIsHydrated(true);
  }, []);

  useLayoutEffect(() => {
    if (!isHydrated) {
      return;
    }

    applyDocumentTheme(theme);
    try {
      localStorage.setItem("voyage-theme", theme);
    } catch {
      // Theme switching still works for the session when storage is unavailable.
    }
  }, [isHydrated, theme]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const setTheme = useCallback(
    (nextTheme: ThemeId) => {
      if (nextTheme === theme) {
        return;
      }

      clearTimers();
      setIsTransitioning(true);

      transitionTimerRef.current = window.setTimeout(() => {
        setThemeState(nextTheme);
      }, 120);

      settleTimerRef.current = window.setTimeout(() => {
        setIsTransitioning(false);
      }, 340);
    },
    [clearTimers, theme],
  );

  const contextValue = useMemo(
    () => ({
      theme,
      setTheme,
      isTransitioning,
    }),
    [isTransitioning, setTheme, theme],
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
      {isTransitioning ? (
        <div className="theme-transition-layer" aria-hidden="true">
          <div className="theme-transition-card">
            <span className="theme-transition-spinner" />
            <span className="theme-transition-text">切换主题中</span>
          </div>
        </div>
      ) : null}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
