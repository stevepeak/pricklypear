/// <reference lib="deno.ns" />
// supabase/functions/extract-doc-text/index.test.ts
// @ts-nocheck

import { assertEquals } from 'https://deno.land/std@0.168.0/testing/asserts.ts';

import '../test-setup.ts';

import { handler } from './index.ts';
import { createMockSupabaseClient } from '../../../tests/mocks/supabaseClientMock.ts';

const USER_ID = '33333333-3333-4333-8333-333333333333';

// A tiny faux-PDF blob with text between `stream` and `endstream` so the naive
// extractor in the function finds something meaningful (≥ 10 chars).
const dummyPdf = new TextEncoder().encode('stream Hello clever Deno endstream');

function authHeaders() {
  return { Authorization: 'Bearer test-token' };
}

Deno.test('extract-doc-text: happy path extracts PDF and stores record', async () => {
  const supabase = createMockSupabaseClient({
    authUser: { id: USER_ID },
    storageDownload: { data: new Blob([dummyPdf]), error: null },
    tables: {
      documents: { data: { id: 'doc-1' }, error: null },
    },
  });

  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ file_path: `${USER_ID}/test.pdf`, filename: 'test.pdf' }),
  });

  const openaiStub = {
    embeddings: {
      create: () => Promise.resolve({ data: [{ embedding: [0.1, 0.2, 0.3] }] }),
    },
  } as const;

  const res = await handler(req, {
    createClient: () => supabase as any,
    getOpenAIClient: () => openaiStub as any,
  });

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.status, 'success');
  assertEquals(body.document_id, 'doc-1');
});

Deno.test('extract-doc-text: unsupported file type returns 400', async () => {
  const supabase = createMockSupabaseClient({ authUser: { id: USER_ID } });

  const req = new Request('http://localhost', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ file_path: `${USER_ID}/test.txt`, filename: 'test.txt' }),
  });

  const res = await handler(req, { createClient: () => supabase as any });
  assertEquals(res.status, 400);
});
