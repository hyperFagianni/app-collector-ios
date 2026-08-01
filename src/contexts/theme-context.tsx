import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

import { Palettes, ThemeColor, ThemeScheme } from '@/constants/theme';
import { getThemePreference, saveThemePreference } from '@/lib/storage';

type ThemeContextValue = {
  scheme: ThemeScheme;
  colors: Record<ThemeColor, string>;
  toggleScheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [scheme, setScheme] = useState<ThemeScheme>('dark');

  useEffect(() => {
    getThemePreference().then((saved) => {
      if (saved) setScheme(saved);
    });
  }, []);

  function toggleScheme() {
    setScheme((prev) => {
      const next: ThemeScheme = prev === 'dark' ? 'light' : 'dark';
      saveThemePreference(next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ scheme, colors: Palettes[scheme], toggleScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}
