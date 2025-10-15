---
description: Testing Guidelines
globs: *.test.ts
---

# Testing Guidelines

This document provides guidelines for writing and maintaining tests in this project.

## Test Structure

### File Organization

- **Co-locate tests**: Place test files in the same directory as the code being tested
- **Naming convention**: Use `*.test.ts` for TypeScript tests and `*.test.tsx` for React component tests
- **One test file per source file**: `myComponent.tsx` → `myComponent.test.tsx`

```
src/
  components/
    MyComponent.tsx
    MyComponent.test.tsx  ✅ Co-located
  hooks/
    useMyHook.ts
    useMyHook.test.ts     ✅ Co-located
```

### Test File Structure

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createMockUser } from '@/test-utils';

// Group related mocks at the top
vi.mock('@/services/myService', () => ({
  myFunction: vi.fn(),
}));

describe('MyHook', () => {
  // Setup and teardown
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Group tests by feature/scenario
  describe('when user is authenticated', () => {
    it('should load data successfully', async () => {
      // Arrange
      const mockUser = createMockUser();

      // Act
      const { result } = renderHook(() => useMyHook());

      // Assert
      expect(result.current.data).toBeDefined();
    });
  });

  describe('error scenarios', () => {
    it('should handle network errors gracefully', async () => {
      // Test error path
    });
  });
});
```

## Mocking Strategies

### When to Use Each Approach

#### 1. `vi.mock()` - Module-level mocks

Use when all tests in the file need the same mock implementation.

```typescript
// At top of file
vi.mock('@/services/myService', () => ({
  getData: vi.fn(),
}));

describe('MyComponent', () => {
  it('test 1', () => {
    // Uses the same mock
  });

  it('test 2', () => {
    // Uses the same mock
  });
});
```

#### 2. `vi.doMock()` - Dynamic mocks

Use when different tests need different mock implementations.

```typescript
describe('MyComponent', () => {
  beforeEach(() => {
    vi.resetModules(); // Required with vi.doMock()
    vi.clearAllMocks();
  });

  it('test with success response', async () => {
    vi.doMock('@/services/myService', () => ({
      getData: vi.fn().mockResolvedValue({ success: true }),
    }));

    const { MyComponent } = await import('./MyComponent');
    // Test...
  });

  it('test with error response', async () => {
    vi.doMock('@/services/myService', () => ({
      getData: vi.fn().mockRejectedValue(new Error('Failed')),
    }));

    const { MyComponent } = await import('./MyComponent');
    // Test...
  });
});
```

**Important**: When using `vi.doMock()`:

- Call `vi.resetModules()` in `beforeEach`
- Import modules dynamically inside each test
- Clean up with `vi.restoreAllMocks()` in `afterEach`

### Standard Mocking Pattern

**Preferred approach for this project:**

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockSupabaseClient } from '@/test-utils';

// Use module-level mocks for simple cases
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {},
}));

describe('MyService', () => {
  let supabaseMock: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create fresh mock instance
    supabaseMock = createMockSupabaseClient();

    // Replace the module export
    const module = require('@/integrations/supabase/client');
    Object.assign(module.supabase, supabaseMock.supabase);
  });

  it('should query database', async () => {
    supabaseMock.mocks.select.mockReturnValue({
      data: [{ id: 1 }],
      error: null,
    });

    // Test...
  });
});
```

## Using Test Utilities

### Mock Factories

Always use factories from `@/test-utils` instead of creating objects inline:

```typescript
// ❌ Bad: Inline object with 'as any'
const message = {
  id: 'm1',
  text: 'Hello',
  threadId: 't1',
} as any;

// ✅ Good: Use factory
import { createMockMessage } from '@/test-utils';

const message = createMockMessage({
  id: 'm1',
  text: 'Hello',
  threadId: 't1',
});
```

### Available Factories

```typescript
import {
  // Data factories
  createMockMessage,
  createMockThread,
  createMockAIThread,
  createMockConnectedUser,
  createMockUser,
  createMockProfile,

  // Bulk creation
  createMockMessages,
  createMockThreads,
  createMockConnectedUsers,

  // Supabase mocks
  createMockSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  mockAuthSession,
  mockNoAuthSession,

  // React testing helpers
  renderWithProviders,
  createTestQueryClient,
} from '@/test-utils';
```

## Testing Patterns

### Testing Hooks

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { createTestQueryClient } from '@/test-utils';

it('should load data', async () => {
  const { result } = renderHook(() => useMyHook());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toBeDefined();
});
```

### Testing Components

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';
import userEvent from '@testing-library/user-event';

it('should handle user interaction', async () => {
  const user = userEvent.setup();

  renderWithProviders(<MyComponent />);

  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);

  await waitFor(() => {
    expect(screen.getByText(/success/i)).toBeInTheDocument();
  });
});
```

### Testing Async Operations

```typescript
it('should handle async operation', async () => {
  const mockFn = vi.fn().mockResolvedValue({ success: true });

  const { result } = renderHook(() => useMyHook());

  await act(async () => {
    await result.current.performAction();
  });

  expect(mockFn).toHaveBeenCalled();
  expect(result.current.status).toBe('success');
});
```

### Testing Error Scenarios

**Always test error paths for async operations:**

```typescript
describe('error handling', () => {
  it('should handle network errors', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    mockApi.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useMyHook());

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('should show user-facing error message', async () => {
    const { toast } = await import('sonner');

    mockApi.mockRejectedValue(new Error('Failed'));

    // Test...

    expect(toast).toHaveBeenCalledWith('Error', {
      description: expect.stringContaining('failed'),
    });
  });
});
```

## Test Coverage Requirements

### What to Test

**For every module, ensure tests cover:**

1. **Happy path**: Normal, successful execution
2. **Error scenarios**: Network errors, validation failures, etc.
3. **Edge cases**: Empty data, null values, boundary conditions
4. **State transitions**: Loading → Success → Error states
5. **User interactions**: Clicks, form submissions, keyboard events (for components)

### Minimum Test Cases

**For a hook:**

- ✅ Successful data loading
- ✅ Error handling
- ✅ Loading states
- ✅ State updates
- ✅ Cleanup on unmount

**For a component:**

- ✅ Renders correctly
- ✅ Handles user interactions
- ✅ Shows loading states
- ✅ Shows error states
- ✅ Accessibility (ARIA attributes)

**For a service:**

- ✅ Successful operation
- ✅ Error response handling
- ✅ Invalid input handling
- ✅ Network errors

## Common Patterns

### Testing with QueryClient

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';

it('should use react-query', async () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  const { result } = renderHook(() => useMyQuery(), { wrapper });

  // Or use the helper:
  // const { result } = renderHook(() => useMyQuery(), {
  //   wrapper: ({ children }) => renderWithProviders(children),
  // });
});
```

### Testing with Router

```typescript
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

it('should navigate', () => {
  render(
    <MemoryRouter initialEntries={['/initial-route']}>
      <MyComponent />
    </MemoryRouter>
  );

  // Or use the helper:
  // renderWithProviders(<MyComponent />, {
  //   initialRoute: '/initial-route'
  // });
});
```

### Testing Real-time Updates

```typescript
it('should handle real-time updates', async () => {
  let realtimeCallback: (data: any) => void;

  vi.doMock('@/contexts/GlobalMessagesContext', () => ({
    useGlobalMessages: () => ({
      registerMessageCallback: (cb: any) => {
        realtimeCallback = cb;
        return vi.fn(); // unsubscribe
      },
    }),
  }));

  const { result } = renderHook(() => useMyHook());

  // Simulate real-time update
  act(() => {
    realtimeCallback({ id: 'new-message' });
  });

  expect(result.current.messages).toContainEqual(
    expect.objectContaining({ id: 'new-message' })
  );
});
```

## Best Practices

### Do's ✅

- **Use descriptive test names**: Explain what is being tested and expected outcome
- **Arrange-Act-Assert**: Structure tests clearly
- **Test one thing**: Each test should verify a single behavior
- **Clean up**: Always restore mocks and clean up in `afterEach`
- **Use factories**: Leverage `@/test-utils` factories for consistent test data
- **Test errors**: Every async operation should have error scenario tests
- **Wait for async**: Use `waitFor()` for async state changes
- **Mock external dependencies**: Don't make real API calls or database queries

### Don'ts ❌

- **Don't use `any` unnecessarily**: Use proper types even in tests
- **Don't test implementation details**: Test behavior, not internal state
- **Don't share state**: Each test should be independent
- **Don't skip cleanup**: Always clean up mocks and timers
- **Don't make tests brittle**: Avoid testing exact text strings or CSS classes when possible
- **Don't add custom timeouts**: Fix the underlying issue instead of increasing timeouts
- **Don't make real network calls**: Always mock external services

## TypeScript in Tests

### Allowed Exceptions

Per project guidelines, `any` is permitted in test files for mocking:

```typescript
// ✅ OK in tests
vi.mock('@/services/api', () => ({
  fetchData: vi.fn() as any,
}));

// ✅ OK for partial mocks
const mockUser = { id: 'user-1' } as any;
```

However, prefer proper typing when feasible:

```typescript
// ✅ Better
import { createMockUser } from '@/test-utils';
const mockUser = createMockUser({ id: 'user-1' });
```

## Examples

### Complete Hook Test

```typescript
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockThread, createMockMessage } from '@/test-utils';

vi.mock('@/services/messageService', () => ({
  getMessages: vi.fn(),
  saveMessage: vi.fn(),
}));

const { getMessages, saveMessage } = await import('@/services/messageService');

describe('useThreadMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading messages', () => {
    it('should load messages successfully', async () => {
      const thread = createMockThread();
      const messages = [createMockMessage(), createMockMessage()];

      vi.mocked(getMessages).mockResolvedValue(messages);

      const { result } = renderHook(() => useThreadMessages(thread.id));

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.messages).toEqual(messages);
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle loading errors', async () => {
      const thread = createMockThread();

      vi.mocked(getMessages).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useThreadMessages(thread.id));

      await act(async () => {
        await result.current.loadMessages();
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.messages).toEqual([]);
    });
  });

  describe('sending messages', () => {
    it('should send message and clear input', async () => {
      const thread = createMockThread();

      vi.mocked(saveMessage).mockResolvedValue(true);

      const { result } = renderHook(() => useThreadMessages(thread.id));

      act(() => {
        result.current.setNewMessage('Test message');
      });

      await act(async () => {
        await result.current.sendMessage();
      });

      expect(saveMessage).toHaveBeenCalledWith(
        expect.objectContaining({ text: 'Test message' })
      );
      expect(result.current.newMessage).toBe('');
    });
  });
});
```

## Running Tests

```bash
# Run all unit tests
bun run test

# Run tests in watch mode
bun run test:watch

# Run specific test file
bun run test src/hooks/useMyHook.test.ts

# Run with coverage
bun run test:coverage

# Run CI checks (type check + lint + build + test)
bun run ci
```

## Debugging Tests

### Common Issues

**Test fails with "not wrapped in act(...)" warning:**

```typescript
// ❌ Missing act wrapper
result.current.updateState();

// ✅ Wrap in act
act(() => {
  result.current.updateState();
});
```

**Async assertion fails:**

```typescript
// ❌ Assertion runs before async completes
await someAsyncOperation();
expect(result.current.data).toBeDefined();

// ✅ Wait for the condition
await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

**Mock not working:**

```typescript
// ❌ Mock defined after import
import { myFunction } from './myModule';
vi.mock('./myModule');

// ✅ Mock before import
vi.mock('./myModule');
const { myFunction } = await import('./myModule');
```

## Resources

- [Vitest Documentation](https://vitest.dev)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
