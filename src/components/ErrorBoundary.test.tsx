import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';
import * as Sentry from '@sentry/react';

// Mock Sentry
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

// Component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render error UI when an error is thrown', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We've encountered an unexpected error/)
    ).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('should not capture error in Sentry in development', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Clear previous calls to Sentry
    vi.clearAllMocks();

    const originalEnv = import.meta.env.VITE_VERCEL_ENV;
    (import.meta.env as any).VITE_VERCEL_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Sentry should not be called in development
    expect(Sentry.captureException).not.toHaveBeenCalled();

    (import.meta.env as any).VITE_VERCEL_ENV = originalEnv;
    consoleErrorSpy.mockRestore();
  });

  it('should show error message in development mode', () => {
    // Suppress console.error for this test
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const originalEnv = import.meta.env.VITE_VERCEL_ENV;
    (import.meta.env as any).VITE_VERCEL_ENV = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error message should be visible in development
    expect(screen.getByText('Test error')).toBeInTheDocument();

    (import.meta.env as any).VITE_VERCEL_ENV = originalEnv;
    consoleErrorSpy.mockRestore();
  });
});
