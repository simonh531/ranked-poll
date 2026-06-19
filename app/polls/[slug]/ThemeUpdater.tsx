"use client";

import { useEffect } from "react";
import { useAppTheme } from "@/components/ThemeProvider";

interface ThemeUpdaterProps {
  theme: string;
}

export default function ThemeUpdater({ theme }: ThemeUpdaterProps) {
  const { setTheme } = useAppTheme();

  useEffect(() => {
    if (theme) {
      setTheme(theme);
    }
  }, [theme, setTheme]);

  return null;
}
