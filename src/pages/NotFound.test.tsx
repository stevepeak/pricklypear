import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NotFound from './NotFound';

describe('NotFound', () => {
  it('should render 404 page', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(
      screen.getByText(
        /The page you're looking for doesn't exist or has been moved/
      )
    ).toBeInTheDocument();
  });

  it('should show Go back and Go to Home buttons', () => {
    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Go back')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
  });

  it('should log error to console', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/non-existent-route']}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/non-existent-route'
    );

    consoleErrorSpy.mockRestore();
  });

  it('should show pathname in development mode', () => {
    const originalEnv = import.meta.env.VITE_VERCEL_ENV;
    (import.meta.env as any).VITE_VERCEL_ENV = 'development';

    render(
      <MemoryRouter initialEntries={['/test-path']}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('/test-path')).toBeInTheDocument();

    (import.meta.env as any).VITE_VERCEL_ENV = originalEnv;
  });
});
