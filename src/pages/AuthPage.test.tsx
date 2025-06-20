import '@testing-library/jest-dom'; // ← enables jest-dom matchers
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest'; // ← vitest utilities
import AuthPage from './AuthPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUpWithMagicLink: vi.fn(),
    user: null,
  }),
}));

describe('AuthPage', () => {
  it('renders "Welcome back" heading for default mode', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /welcome back/i })
    ).toBeInTheDocument();
  });

  it('renders "Create your account" heading for signup mode via mode query', () => {
    render(
      <MemoryRouter initialEntries={['/auth?mode=signup']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /create your account/i })
    ).toBeInTheDocument();
  });

  it('renders "Create your account" heading for signup mode via signup query', () => {
    render(
      <MemoryRouter initialEntries={['/auth?signup=true']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /create your account/i })
    ).toBeInTheDocument();
  });
});
