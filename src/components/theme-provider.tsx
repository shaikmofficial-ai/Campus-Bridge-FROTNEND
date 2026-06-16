import { useEffect, useState } from "react";
import { applyTheme, getTheme, type ThemeId } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);
  return <>{children}</>;
}

export function useTheme(): [ThemeId, (t: ThemeId) => void] {
  const [theme, setTheme] = useState<ThemeId>(() => getTheme());
  useEffect(() => {
    const onChange = (e: Event) => setTheme((e as CustomEvent<ThemeId>).detail);
    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);
  return [theme, (t) => applyTheme(t)];
}
