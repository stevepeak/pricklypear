import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
import { handler } from "./index.ts";

function createFetch(success: boolean) {
  return async () => {
    if (success) {
      return {
        json: async () => ({
          data: { issueCreate: { success: true, issue: { id: "1" } } },
        }),
      } as unknown;
    }
    return {
      json: async () => ({
        data: { issueCreate: { success: false } },
        errors: [{ message: "fail" }],
      }),
    } as unknown;
  };
}

Deno.test("feature-request missing fields", async () => {
  const req = new Request("http://", {
    method: "POST",
    body: JSON.stringify({}),
  });
  const res = await handler(req, { fetch: createFetch(true) });
  assertEquals(res.status, 400);
});

Deno.test("feature-request success", async () => {
  const body = JSON.stringify({ title: "a", description: "b" });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, { fetch: createFetch(true) });
  const data = await res.json();
  assertEquals(res.status, 200);
  assertEquals(data.success, true);
});

Deno.test("feature-request error", async () => {
  const body = JSON.stringify({ title: "a", description: "b" });
  const req = new Request("http://", { method: "POST", body });
  const res = await handler(req, { fetch: createFetch(false) });
  assertEquals(res.status, 500);
});
