import {
  assertEquals,
  assertExists,
} from 'https://deno.land/std@0.168.0/testing/asserts.ts';
import { handler } from './index.ts';
import type { HandlerDeps } from './index.ts';

Deno.test(
  'summarize-thread: should return 400 if threadId is missing',
  async () => {
    const mockSupabase: any = {
      from: () => mockSupabase,
      select: () => mockSupabase,
      eq: () => mockSupabase,
      order: () => mockSupabase,
      update: () => mockSupabase,
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () => Promise.resolve({}),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 400);
    assertEquals(data.error, 'ThreadId is required');
  }
);

Deno.test(
  'summarize-thread: should return CORS headers on OPTIONS request',
  async () => {
    const req = new Request('http://localhost', {
      method: 'OPTIONS',
    });

    const response = await handler(req);

    assertEquals(response.status, 200);
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*');
  }
);

Deno.test(
  'summarize-thread: should return 404 if no messages found for thread',
  async () => {
    const mockSupabase: any = {
      from: () => mockSupabase,
      select: () => mockSupabase,
      eq: () => mockSupabase,
      order: () =>
        Promise.resolve({
          data: [],
          error: null,
        }),
      update: () => mockSupabase,
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () => Promise.resolve({}),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 404);
    assertEquals(data.error, 'No messages found for this thread');
  }
);

Deno.test(
  'summarize-thread: should generate summary and update thread',
  async () => {
    const mockMessages = [
      {
        text: 'Hello there',
        timestamp: '2024-01-01T10:00:00Z',
        profile: { name: 'Alice' },
        type: 'user_message',
      },
      {
        text: 'Hi Alice, how are you?',
        timestamp: '2024-01-01T10:01:00Z',
        profile: { name: 'Bob' },
        type: 'user_message',
      },
      {
        text: 'I am doing well, thanks!',
        timestamp: '2024-01-01T10:02:00Z',
        profile: { name: 'Alice' },
        type: 'user_message',
      },
    ];

    let orderCalled = false;
    let updateCalled = false;
    let summaryValue = '';

    const mockSupabase: any = {
      from: (table: string) => {
        if (table === 'messages') {
          return {
            select: () => ({
              eq: () => ({
                order: () => {
                  orderCalled = true;
                  return Promise.resolve({
                    data: mockMessages,
                    error: null,
                  });
                },
              }),
            }),
          };
        } else if (table === 'threads') {
          return {
            update: (data: any) => {
              updateCalled = true;
              summaryValue = data.summary;
              return {
                eq: () => Promise.resolve({ error: null }),
              };
            },
          };
        }
        return mockSupabase;
      },
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () =>
            Promise.resolve({
              choices: [
                {
                  message: {
                    content:
                      'Alice and Bob exchanged greetings. Alice is doing well.',
                  },
                },
              ],
            }),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 200);
    assertEquals(
      data.summary,
      'Alice and Bob exchanged greetings. Alice is doing well.'
    );
    assertEquals(orderCalled, true);
    assertEquals(updateCalled, true);
    assertEquals(
      summaryValue,
      'Alice and Bob exchanged greetings. Alice is doing well.'
    );
  }
);

Deno.test(
  'summarize-thread: should handle database errors when fetching messages',
  async () => {
    const mockSupabase: any = {
      from: () => mockSupabase,
      select: () => mockSupabase,
      eq: () => mockSupabase,
      order: () =>
        Promise.resolve({
          data: null,
          error: { message: 'Database connection failed' },
        }),
      update: () => mockSupabase,
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () => Promise.resolve({}),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 500);
    assertExists(data.error);
  }
);

Deno.test(
  'summarize-thread: should handle database errors when updating thread',
  async () => {
    const mockMessages = [
      {
        text: 'Test message',
        timestamp: '2024-01-01T10:00:00Z',
        profile: { name: 'Alice' },
        type: 'user_message',
      },
    ];

    const mockSupabase: any = {
      from: (table: string) => {
        if (table === 'messages') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: mockMessages,
                    error: null,
                  }),
              }),
            }),
          };
        } else if (table === 'threads') {
          return {
            update: () => ({
              eq: () =>
                Promise.resolve({
                  error: { message: 'Failed to update thread' },
                }),
            }),
          };
        }
        return mockSupabase;
      },
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () =>
            Promise.resolve({
              choices: [{ message: { content: 'Test summary' } }],
            }),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 500);
    assertExists(data.error);
  }
);

Deno.test(
  'summarize-thread: should handle OpenAI errors gracefully',
  async () => {
    const mockMessages = [
      {
        text: 'Test message',
        timestamp: '2024-01-01T10:00:00Z',
        profile: { name: 'Alice' },
        type: 'user_message',
      },
    ];

    const mockSupabase: any = {
      from: () => mockSupabase,
      select: () => mockSupabase,
      eq: () => mockSupabase,
      order: () =>
        Promise.resolve({
          data: mockMessages,
          error: null,
        }),
      update: () => mockSupabase,
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () => Promise.reject(new Error('OpenAI API error')),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 500);
    assertExists(data.error);
  }
);

Deno.test(
  'summarize-thread: should use default summary if OpenAI returns empty response',
  async () => {
    const mockMessages = [
      {
        text: 'Test message',
        timestamp: '2024-01-01T10:00:00Z',
        profile: { name: 'Alice' },
        type: 'user_message',
      },
    ];

    const mockSupabase: any = {
      from: (table: string) => {
        if (table === 'messages') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: mockMessages,
                    error: null,
                  }),
              }),
            }),
          };
        } else if (table === 'threads') {
          return {
            update: () => ({
              eq: () => Promise.resolve({ error: null }),
            }),
          };
        }
        return mockSupabase;
      },
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: () =>
            Promise.resolve({
              choices: [{ message: { content: '' } }],
            }),
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    const response = await handler(req, deps);
    const data = await response.json();

    assertEquals(response.status, 200);
    assertEquals(data.summary, 'No summary generated');
  }
);

Deno.test(
  'summarize-thread: should format conversation text correctly with timestamps',
  async () => {
    const mockMessages = [
      {
        text: 'First message',
        timestamp: '2024-01-01T10:00:00Z',
        profile: { name: 'Alice' },
        type: 'user_message',
      },
      {
        text: 'Second message',
        timestamp: '2024-01-01T10:01:00Z',
        profile: { name: 'Bob' },
        type: 'user_message',
      },
    ];

    let capturedPrompt = '';

    const mockSupabase: any = {
      from: (table: string) => {
        if (table === 'messages') {
          return {
            select: () => ({
              eq: () => ({
                order: () =>
                  Promise.resolve({
                    data: mockMessages,
                    error: null,
                  }),
              }),
            }),
          };
        } else if (table === 'threads') {
          return {
            update: () => ({
              eq: () => Promise.resolve({ error: null }),
            }),
          };
        }
        return mockSupabase;
      },
    };

    const mockOpenAI: any = {
      chat: {
        completions: {
          create: (params: any) => {
            capturedPrompt = params.messages[1].content;
            return Promise.resolve({
              choices: [{ message: { content: 'Summary' } }],
            });
          },
        },
      },
    };

    const deps: HandlerDeps = {
      createClient: () => mockSupabase,
      getOpenAIClient: () => mockOpenAI,
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ threadId: 'thread-123' }),
    });

    await handler(req, deps);

    assertExists(capturedPrompt);
    assertEquals(capturedPrompt.includes('Alice'), true);
    assertEquals(capturedPrompt.includes('Bob'), true);
    assertEquals(capturedPrompt.includes('First message'), true);
    assertEquals(capturedPrompt.includes('Second message'), true);
  }
);
