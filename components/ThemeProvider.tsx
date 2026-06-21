"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { THEME_PRESETS, getContrastColor, getSecondaryColor } from "@/utils/themes";


interface ThemeContextType {
  theme: string; // preset key (e.g. 'indigo') or custom hex color (e.g. '#ff0055')
  setTheme: (theme: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<string>("indigo");

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;

    if (THEME_PRESETS[theme]) {
      const preset = THEME_PRESETS[theme];
      root.style.setProperty("--primary", preset.primary);
      root.style.setProperty("--secondary", preset.secondary);
      root.style.setProperty("--primary-foreground", preset.primaryForeground);
      root.style.setProperty("--ring", preset.ring);
    } else if (theme.startsWith("#")) {
      let primaryColor = theme;
      let secondaryColor = "";

      if (theme.includes("_")) {
        const parts = theme.split("_");
        primaryColor = parts[0];
        secondaryColor = parts[1];
      } else {
        primaryColor = theme;
        secondaryColor = getSecondaryColor(theme);
      }

      root.style.setProperty("--primary", primaryColor);
      root.style.setProperty("--secondary", secondaryColor);
      root.style.setProperty("--primary-foreground", getContrastColor(primaryColor));
      root.style.setProperty("--ring", primaryColor);
    }
  }, [theme]);



  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within a ThemeProvider");
  }
  return context;
}
