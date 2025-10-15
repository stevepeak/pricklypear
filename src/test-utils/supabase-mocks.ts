/**
 * Reusable Supabase client mocks for tests
 */

import { vi } from 'vitest';

/**
 * Creates a mock Supabase client with common operations
 */
export function createMockSupabaseClient() {
  // Storage mocks
  const uploadMock = vi.fn();
  const fromStorageMock = vi.fn(() => ({
    upload: uploadMock,
  }));

  // Database query mocks
  const selectMock = vi.fn();
  const insertMock = vi.fn();
  const updateMock = vi.fn();
  const deleteMock = vi.fn();
  const upsertMock = vi.fn();
  const eqMock = vi.fn();
  const inMock = vi.fn();
  const orderMock = vi.fn();
  const limitMock = vi.fn();
  const singleMock = vi.fn();
  const rpcMock = vi.fn();

  // Chain methods return objects with further chainable methods
  const createChainableMock = () => ({
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    upsert: upsertMock,
    eq: eqMock,
    in: inMock,
    order: orderMock,
    limit: limitMock,
    single: singleMock,
  });

  selectMock.mockReturnValue(createChainableMock());
  insertMock.mockReturnValue(createChainableMock());
  updateMock.mockReturnValue(createChainableMock());
  deleteMock.mockReturnValue(createChainableMock());
  upsertMock.mockReturnValue(createChainableMock());
  eqMock.mockReturnValue(createChainableMock());
  inMock.mockReturnValue(createChainableMock());
  orderMock.mockReturnValue(createChainableMock());
  limitMock.mockReturnValue(createChainableMock());

  // Default to successful empty query
  singleMock.mockResolvedValue({ data: null, error: null });

  const fromMock = vi.fn(() => createChainableMock());

  // Functions mock
  const invokeMock = vi.fn();

  // Auth mocks
  const getSessionMock = vi.fn();
  const getUserMock = vi.fn();
  const signInMock = vi.fn();
  const signOutMock = vi.fn();
  const signInWithOtpMock = vi.fn();
  const onAuthStateChangeMock = vi.fn();

  const supabaseMock = {
    from: fromMock,
    rpc: rpcMock,
    storage: {
      from: fromStorageMock,
    },
    functions: {
      invoke: invokeMock,
    },
    auth: {
      getSession: getSessionMock,
      getUser: getUserMock,
      signInWithPassword: signInMock,
      signOut: signOutMock,
      signInWithOtp: signInWithOtpMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  };

  return {
    supabase: supabaseMock,
    mocks: {
      // Database
      from: fromMock,
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
      upsert: upsertMock,
      eq: eqMock,
      in: inMock,
      order: orderMock,
      limit: limitMock,
      single: singleMock,
      rpc: rpcMock,
      // Storage
      fromStorage: fromStorageMock,
      upload: uploadMock,
      // Functions
      invoke: invokeMock,
      // Auth
      getSession: getSessionMock,
      getUser: getUserMock,
      signIn: signInMock,
      signOut: signOutMock,
      signInWithOtp: signInWithOtpMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  };
}

/**
 * Creates a successful query response
 */
export function createSuccessResponse<T>(data: T): {
  data: T;
  error: null;
} {
  return { data, error: null };
}

/**
 * Creates an error query response
 */
export function createErrorResponse(message: string): {
  data: null;
  error: { message: string; details: null; hint: null; code: string };
} {
  return {
    data: null,
    error: { message, details: null, hint: null, code: 'ERROR' },
  };
}

/**
 * Mocks Supabase auth session
 */
export function mockAuthSession(
  userId = 'user-1',
  accessToken = 'token-123'
): {
  data: {
    session: {
      access_token: string;
      user: { id: string; email: string };
    };
  };
  error: null;
} {
  return {
    data: {
      session: {
        access_token: accessToken,
        user: {
          id: userId,
          email: 'test@example.com',
        },
      },
    },
    error: null,
  };
}

/**
 * Mocks no auth session (logged out)
 */
export function mockNoAuthSession(): {
  data: { session: null };
  error: null;
} {
  return {
    data: { session: null },
    error: null,
  };
}
