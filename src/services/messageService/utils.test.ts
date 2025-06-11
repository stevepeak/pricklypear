import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

const { captureException } = await import('@sentry/react');
const { handleError } = await import('./utils');

let consoleError: ReturnType<typeof vi.spyOn> | undefined;

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  consoleError?.mockRestore();
  vi.clearAllMocks();
});

describe('handleError', () => {
  it('logs with sentry and returns false', () => {
    const err = new Error('oops');
    const result = handleError(err, 'ctx');
    expect(result).toBe(false);
    expect(captureException).toHaveBeenCalledWith(err);
    expect(console.error).toHaveBeenCalledWith('Error in ctx:', err);
  });
});
