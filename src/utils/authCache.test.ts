import { describe, it, expect, vi, beforeEach } from "vitest";

let supabase;
let getAuthCallback;

vi.mock("@/integrations/supabase/client", () => {
  let callback;
  const getUser = vi.fn();
  const profileQuery = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { name: "Alice" } }),
  };
  const from = vi.fn(() => profileQuery);
  const supabaseMock = {
    auth: {
      getUser,
      onAuthStateChange: vi.fn((cb) => {
        callback = cb;
      }),
    },
    from,
  };
  return {
    supabase: supabaseMock,
    __getAuthCallback: () => callback,
    __profileQuery: profileQuery,
  };
});

let profileQuery;

beforeEach(async () => {
  vi.resetModules();
  ({
    supabase,
    __getAuthCallback: getAuthCallback,
    __profileQuery: profileQuery,
  } = await import("@/integrations/supabase/client"));
  vi.clearAllMocks();
});

async function load() {
  return await import("./authCache");
}

describe("getCurrentUser caching", () => {
  it("caches results until forceRefresh", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u1" } } });
    const mod = await load();

    const user1 = await mod.getCurrentUser();
    expect(user1).toEqual({ id: "u1" });
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);

    const user2 = await mod.getCurrentUser();
    expect(user2).toBe(user1);
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);

    await mod.getCurrentUser(true);
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(2);
  });

  it("shares in-flight requests", async () => {
    const promise = Promise.resolve({ data: { user: { id: "u2" } } });
    supabase.auth.getUser.mockReturnValue(promise);
    const mod = await load();

    const p1 = mod.getCurrentUser();
    const p2 = mod.getCurrentUser();
    const [u1, u2] = await Promise.all([p1, p2]);
    expect(u1).toEqual({ id: "u2" });
    expect(u2).toEqual({ id: "u2" });
    expect(supabase.auth.getUser).toHaveBeenCalledTimes(1);
  });

  it("returns cached value after sign out", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "u3" } } });
    const mod = await load();

    await mod.getCurrentUser();
    const count = supabase.auth.getUser.mock.calls.length;

    getAuthCallback()("SIGNED_OUT", null);

    const user = await mod.getCurrentUser();
    expect(user).toBeNull();
    expect(supabase.auth.getUser.mock.calls.length).toBe(count);
  });

  it("clears in-flight request on error", async () => {
    supabase.auth.getUser.mockRejectedValueOnce(new Error("fail"));
    const mod = await load();

    await expect(mod.getCurrentUser()).rejects.toThrow("fail");

    supabase.auth.getUser.mockResolvedValueOnce({ data: { user: null } });
    const count = supabase.auth.getUser.mock.calls.length;
    const user = await mod.getCurrentUser();
    expect(user).toBeNull();
    expect(supabase.auth.getUser.mock.calls.length).toBe(count + 1);
  });
});

describe("requireCurrentUser", () => {
  it("throws when no user", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const mod = await load();

    await expect(mod.requireCurrentUser()).rejects.toThrow(
      "No authenticated user found",
    );
  });
});

it("fetches user profile", async () => {
  profileQuery.single.mockResolvedValueOnce({ data: { name: "Bob" } });
  const mod = await load();
  const profile = await mod.getUserProfile({ id: "u1" } as unknown as {
    id: string;
  });
  expect(profile).toEqual({ name: "Bob" });
  expect(supabase.from).toHaveBeenCalledWith("profiles");
  expect(profileQuery.eq).toHaveBeenCalledWith("id", "u1");
});
