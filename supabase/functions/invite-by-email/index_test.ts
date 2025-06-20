// @ts-nocheck
// This file will not be type-checked by Deno or tsc

import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handler } from "./index.ts";

function createSupabase(existing: boolean) {
  return {
    from(_table: string) {
      return {
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle: async () => ({ data: { name: "Inviter" }, error: null }),
        insert() {
          return {
            select() {
              return {
                single: async () => ({ data: { id: "c" }, error: null }),
              };
            },
          };
        },
      } as unknown;
    },
    auth: {
      admin: {
        listUsers: async () => ({
          data: { users: existing ? [{ id: "u", email: "e" }] : [] },
          error: null,
        }),
      },
    },
  } as unknown;
}

const email = async (_args: unknown) => {};

Deno.test("invite-by-email validation", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res = await handler(req, {
    getSupabaseServiceClient: () => createSupabase(true),
    sendEmail: email,
  });
  assertEquals(res.status, 400);
});

Deno.test("invite-by-email success existing", async () => {
  const body = JSON.stringify({ userId: "1", email: "x@test.com" });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, {
    getSupabaseServiceClient: () => createSupabase(true),
    sendEmail: email,
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.success, true);
});

Deno.test("invite-by-email success new user", async () => {
  const body = JSON.stringify({ userId: "1", email: "new@test.com" });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, {
    getSupabaseServiceClient: () => createSupabase(false),
    sendEmail: email,
  });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.success, true);
});
