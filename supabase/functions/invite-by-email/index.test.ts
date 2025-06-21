/// <reference lib="deno.ns" />

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import '../test-setup.ts';

import { handler } from './index.ts';
import { createMockSupabaseClient } from '../../../tests/mocks/supabaseClientMock.ts';

const USER_ID = '00000000-0000-4000-8000-000000000000';
const EMAIL = 'invitee@example.com';

Deno.test(
  'invite-by-email: happy-path sends invitation and returns success',
  async () => {
    const supabase = createMockSupabaseClient({
      tables: {
        profiles: { data: { name: 'Alice Inviter' }, error: null },
        connections: { data: { id: 'conn-1' }, error: null },
      },
    });

    const sendEmailCalls: unknown[] = [];
    const sendEmailMock = (args: unknown) => {
      sendEmailCalls.push(args);
      return Promise.resolve();
    };

    const req = new Request('http://localhost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, email: EMAIL }),
    });

    const res = await handler(req, {
      getSupabaseServiceClient: () => supabase as any,
      sendEmail: sendEmailMock,
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.success, true);
    assertEquals(json.connection.id, 'conn-1');
    assertEquals(sendEmailCalls.length, 1);
  }
);

Deno.test('invite-by-email: invalid email -> 400', async () => {
  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: USER_ID, email: 'not-an-email' }),
  });

  const res = await handler(req);
  assertEquals(res.status, 400);
  const body = await res.json();
  assertEquals(body.success, false);
});
