"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ThemeId } from "@/content/site";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): ThemeId {
  if (typeof document === "undefined") {
    return "clear";
  }

  const theme = document.documentElement.dataset.theme;
  return theme === "voyage" || theme === "night" || theme === "archive" ? theme : "clear";
}

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<ThemeId>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("voyage-theme", theme);
  }, [theme]);

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
