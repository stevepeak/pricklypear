import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get system theme
const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

// Helper function to apply theme
const applyTheme = (theme: Theme) => {
  const effectiveTheme = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // Initial state: light for guests, otherwise stored preference or “system”.
  const [theme, setTheme] = useState<Theme>(() => {
    if (!user) return 'light';
    const storedTheme = localStorage.getItem('theme') as Theme;
    return storedTheme ?? 'system';
  });

  /**
   * Persist the theme only for authenticated users.
   * Always apply the theme to the document root.
   */
  useEffect(() => {
    if (user) {
      localStorage.setItem('theme', theme);
    }
    applyTheme(theme);
  }, [theme, user]);

  /**
   * Sync theme with authentication state.
   * - While loading: do nothing.
   * - Logged out : force light & clear preference.
   * - Logged in  : restore stored preference (or system).
   */
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setTheme('light');
      localStorage.removeItem('theme');
      return;
    }

    const storedTheme = (localStorage.getItem('theme') as Theme) ?? 'system';
    setTheme(storedTheme);
  }, [user, loading]);

  // Listen for system theme changes
  useEffect(() => {
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
