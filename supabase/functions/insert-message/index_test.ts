// @ts-nocheck
// This file will not be type-checked by Deno or tsc

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handler } from "./index.ts";

function createSupabase() {
  return {
    from(_table: string) {
      return {
        insert() {
          return {
            select() {
              return {
                single: async () => ({ data: { id: "1" }, error: null }),
              };
            },
          };
        },
        select() {
          return {
            eq() {
              return {
                maybeSingle: async () => ({
                  data: [
                    {
                      profiles: {
                        id: "u",
                        name: "User",
                        notifications: { newMessages: { email: true } },
                      },
                    },
                  ],
                  error: null,
                }),
              };
            },
          };
        },
        update() {
          return { eq: async () => ({ error: null }) };
        },
      } as unknown;
    },
  } as unknown;
}

const slack = async (_args: unknown) => {};
const email = async (_args: unknown) => {};

Deno.test("insert-message validation", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res = await handler(req, {
    getSupabaseServiceClient: createSupabase,
    sendEmail: email,
    sendSlackNotification: slack,
  });
  assertEquals(res.status, 400);
});

Deno.test("insert-message success", async () => {
  const body = JSON.stringify({
    text: "hello",
    threadId: "1",
    userId: "2",
    type: "user_message",
    details: { foo: "bar" },
  });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, {
    getSupabaseServiceClient: createSupabase,
    sendEmail: email,
    sendSlackNotification: slack,
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.id, "1");
});
