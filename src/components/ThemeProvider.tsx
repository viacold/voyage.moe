"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ThemeId } from "@/content/site";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeId(theme: string | undefined): theme is ThemeId {
  return theme === "clear" || theme === "voyage" || theme === "night" || theme === "archive";
}

function readDocumentTheme(): ThemeId {
  const theme = document.documentElement.dataset.theme;
  return isThemeId(theme) ? theme : "clear";
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<ThemeId>("clear");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setThemeState(readDocumentTheme());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("voyage-theme", theme);
    } catch {
      // Theme switching still works for the session when storage is unavailable.
    }
  }, [isHydrated, theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
