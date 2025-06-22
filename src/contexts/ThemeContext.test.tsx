import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

import { ThemeProvider, useTheme } from './ThemeContext';

function ShowTheme() {
  const { theme } = useTheme();
  return <span data-testid="theme">{theme}</span>;
}

describe('ThemeProvider (unauthenticated user)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    // Ensure document root has no lingering dark class
    document.documentElement.classList.remove('dark');
    localStorage.clear();
  });

  it('forces light theme and does not add dark class', () => {
    render(
      <ThemeProvider>
        <ShowTheme />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
