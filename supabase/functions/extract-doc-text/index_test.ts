// @ts-nocheck
// This file will not be type-checked by Deno or tsc

import { assertEquals } from 'https://deno.land/std/testing/asserts.ts';
import { handler } from './index.ts';

function createSupabase(authUser: boolean) {
  return {
    auth: {
      getUser: async () => ({
        data: { user: authUser ? { id: 'u' } : null },
        error: authUser ? null : new Error('bad'),
      }),
    },
    storage: {
      from() {
        return {
          download: async () => ({ data: new Blob(['data']), error: null }),
        };
      },
    },
    from() {
      return {
        insert() {
          return {
            select() {
              return {
                single: async () => ({ data: { id: 'doc' }, error: null }),
              };
            },
          };
        },
      };
    },
  } as unknown;
}

const openai = {
  embeddings: { create: async () => ({ data: [{ embedding: [] }] }) },
};

Deno.test('extract-doc-text unauthorized', async () => {
  const req = new Request('http://', {
    method: 'POST',
    body: JSON.stringify({}),
    headers: { Authorization: '' },
  });
  const res = await handler(req, {
    createClient: () => createSupabase(false),
    getOpenAIClient: () => openai,
  });
  assertEquals(res.status, 401);
});

Deno.test('extract-doc-text success', async () => {
  const body = JSON.stringify({
    file_path: 'u/file.pdf',
    filename: 'file.pdf',
  });
  const req = new Request('http://', {
    method: 'POST',
    body,
    headers: { Authorization: 'token' },
  });
  const res = await handler(req, {
    createClient: () => createSupabase(true),
    getOpenAIClient: () => openai,
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.status, 'success');
});
