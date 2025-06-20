// @ts-nocheck
// This file will not be type-checked by Deno or tsc

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handler } from "./index.ts";

function createSupabase(success: boolean) {
  return {
    from(table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        order() {
          return this;
        },
        limit() {
          if (success && table === "messages") {
            return Promise.resolve({
              data: [
                { text: "hi", timestamp: Date.now(), profiles: { name: "A" } },
              ],
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: { message: "err" } });
        },
        single() {
          if (success && table === "threads") {
            return Promise.resolve({
              data: { topic: "t", title: "T" },
              error: null,
            });
          }
          return Promise.resolve({ data: null, error: { message: "bad" } });
        },
      } as unknown;
    },
  } as unknown;
}

const openai = {
  chat: {
    completions: {
      create: async () => ({ choices: [{ message: { content: "ok" } }] }),
    },
  },
};

Deno.test("review-message missing fields", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res = await handler(req, {
    getOpenAIClient: () => openai,
    getSupabaseServiceClient: () => createSupabase(true),
  });
  assertEquals(res.status, 400);
});

Deno.test("review-message success", async () => {
  const body = JSON.stringify({ message: "hello", threadId: "1" });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, {
    getOpenAIClient: () => openai,
    getSupabaseServiceClient: () => createSupabase(true),
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.rejected, false);
  assertEquals(data.rephrasedMessage, "ok");
});

Deno.test("review-message fetch error", async () => {
  const body = JSON.stringify({ message: "hello", threadId: "1" });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, {
    getOpenAIClient: () => openai,
    getSupabaseServiceClient: () => createSupabase(false),
  });
  assertEquals(res.status, 500);
});
