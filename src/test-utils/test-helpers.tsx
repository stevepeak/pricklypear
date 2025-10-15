/**
 * Test helper utilities for rendering components with providers
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

/**
 * Creates a new QueryClient for each test with disabled retries
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
}

/**
 * Wrapper with all common providers (QueryClient, Router, etc.)
 */
export function AllProviders({
  children,
  queryClient,
  initialRoute = '/',
}: AllProvidersProps) {
  const testQueryClient = queryClient ?? createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient;
  initialRoute?: string;
}

/**
 * Custom render function that includes all providers
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { queryClient, initialRoute, ...renderOptions } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AllProviders queryClient={queryClient} initialRoute={initialRoute}>
        {children}
      </AllProviders>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Wrapper with just QueryClient provider
 */
export function QueryClientWrapper({
  children,
  queryClient,
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
}) {
  const testQueryClient = queryClient ?? createTestQueryClient();

  return (
    <QueryClientProvider client={testQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

/**
 * Wrapper with just Router provider
 */
export function RouterWrapper({
  children,
  initialRoute = '/',
}: {
  children: React.ReactNode;
  initialRoute?: string;
}) {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
  );
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
