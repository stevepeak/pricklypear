import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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
  it('logs error and returns false', () => {
    const err = new Error('oops');
    const result = handleError(err, 'ctx');
    expect(result).toBe(false);
    // In development (test environment), Sentry is not called
    // In production, it would be called via logger.error
    expect(console.error).toHaveBeenCalledWith('[ERROR] Error in ctx', err);
  });
});
