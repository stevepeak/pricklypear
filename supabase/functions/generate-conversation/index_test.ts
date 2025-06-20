// @ts-nocheck
// This file will not be type-checked by Deno or tsc

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handler } from "./index.ts";

function createSupabase() {
  return {
    from(_table: string) {
      const q: Record<string, unknown> = {
        select() {
          return q;
        },
        eq() {
          return q;
        },
        single: async () => ({
          data: {
            title: "T",
            topic: "top",
            thread_participants: [{ user_id: "u" }],
          },
          error: null,
        }),
      };
      return q;
    },
  } as unknown;
}

const openai = {
  chat: {
    completions: {
      create: async () => ({
        choices: [
          {
            message: {
              content:
                '[{"user_id":"u","text":"hi","timestamp":"2020-01-01T00:00:00Z"}]',
            },
          },
        ],
      }),
    },
  },
};

Deno.test("generate-conversation parse error", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res = await handler(req, {
    getSupabaseServiceClient: createSupabase,
    getOpenAIClient: () => openai,
  });
  assertEquals(res.status, 500);
});

Deno.test("generate-conversation success", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({ threadId: "1" }),
  });
  const res = await handler(req, {
    getSupabaseServiceClient: createSupabase,
    getOpenAIClient: () => openai,
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.success, true);
});
