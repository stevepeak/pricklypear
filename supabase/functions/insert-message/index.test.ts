/// <reference lib="deno.ns" />
// supabase/functions/insert-message/index.test.ts
// @ts-nocheck

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import '../test-setup.ts';

import { handler } from './index.ts';
import { createMockSupabaseClient } from '../../../tests/mocks/supabaseClientMock.ts';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const THREAD_ID = '22222222-2222-4222-8222-222222222222';

Deno.test('insert-message: happy path inserts message and returns id', async () => {
  const supabase = createMockSupabaseClient({
    tables: {
      messages: { data: { id: 'msg-1' }, error: null },
    },
  });

  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: 'Hello world',
      threadId: THREAD_ID,
      userId: USER_ID,
      type: 'user_message',
    }),
  });

  const res = await handler(req, {
    getSupabaseServiceClient: () => supabase as any,
  });

  assertEquals(res.status, 200);
  const json = await res.json();
  assertEquals(json.id, 'msg-1');
});

Deno.test('insert-message: validation error when text empty -> 400', async () => {
  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: '',
      threadId: THREAD_ID,
      userId: USER_ID,
      type: 'user_message',
    }),
  });

  const res = await handler(req);
  assertEquals(res.status, 400);
});
