import '@testing-library/jest-dom'; // ← enables jest-dom matchers
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest'; // ← vitest utilities
import AuthPage from './AuthPage';

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    sendMagicLink: vi.fn(),
    // Explicitly declare user as null of the correct type to avoid implicit-any
    user: null as null,
  }),
}));

describe('AuthPage', () => {
  it('renders "Sign in to Prickly Pear" heading for default mode', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /sign in to prickly pear/i })
    ).toBeInTheDocument();
  });

  it('renders "Join Prickly Pear" heading for signup mode via mode query', () => {
    render(
      <MemoryRouter initialEntries={['/auth?mode=signup']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /join prickly pear/i })
    ).toBeInTheDocument();
  });

  it('renders "Join Prickly Pear" heading for signup mode via signup query', () => {
    render(
      <MemoryRouter initialEntries={['/auth?signup=true']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(
      screen.getByRole('heading', { name: /join prickly pear/i })
    ).toBeInTheDocument();
  });

  it('renders email input field', () => {
    render(
      <MemoryRouter initialEntries={['/auth']}>
        <AuthPage />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });
});
