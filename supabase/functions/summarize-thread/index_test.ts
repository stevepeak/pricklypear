// @ts-nocheck
// This file will not be type-checked by Deno or tsc

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handler } from "./index.ts";

function createSupabase() {
  return {
    from(table: string) {
      const q: Record<string, unknown> = {
        select() {
          return q;
        },
        eq() {
          return q;
        },
        order() {
          return Promise.resolve({
            data: [
              {
                text: "hi",
                timestamp: Date.now(),
                profile: { name: "A" },
                type: "user_message",
              },
            ],
            error: null,
          });
        },
        single() {
          return Promise.resolve({
            data: { topic: "t", title: "T" },
            error: null,
          });
        },
        update() {
          return { eq: async () => ({ error: null }) };
        },
      };
      return q;
    },
  } as unknown;
}

const openai = {
  chat: {
    completions: {
      create: async () => ({ choices: [{ message: { content: "summary" } }] }),
    },
  },
};

Deno.test("summarize-thread missing id", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res = await handler(req, {
    createClient: () => createSupabase(),
    getOpenAIClient: () => openai,
  });
  assertEquals(res.status, 400);
});

Deno.test("summarize-thread success", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({ threadId: "1" }),
  });
  const res = await handler(req, {
    createClient: () => createSupabase(),
    getOpenAIClient: () => openai,
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.summary, "summary");
});
