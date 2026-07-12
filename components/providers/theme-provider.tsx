"use client";

import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

export type Theme = "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  ready: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

// The app is dark-only. This provider keeps a stable API for consumers but
// always resolves to the dark theme and never touches localStorage.
export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("dark");
    root.classList.remove("light");
    root.style.colorScheme = "dark";
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: "dark",
      setTheme: () => {},
      toggleTheme: () => {},
      ready: true,
    }),
    []
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
