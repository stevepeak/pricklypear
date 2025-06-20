import React, { createContext, useContext, useEffect, useState } from 'react';
import { isWeb } from '@/utils/platform';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get system theme
const getSystemTheme = (): Theme =>
  isWeb() && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

// Helper function to apply theme
const applyTheme = (theme: Theme) => {
  if (!isWeb()) return;
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (isWeb()) {
      return (localStorage.getItem('theme') as Theme) ?? 'system';
    }
    return 'system';
  });

  // Apply theme on mount and when theme changes
  useEffect(() => {
    if (!isWeb()) return;
    localStorage.setItem('theme', theme);
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isWeb()) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    // Apply initial theme
    applyTheme(theme);

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
