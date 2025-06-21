// Minimal stub for `@supabase/supabase-js` so Deno unit tests don't attempt to
// load the real (and heavy) implementation.
export type SupabaseClient = unknown;
export function createClient(): SupabaseClient {
  return {} as SupabaseClient;
}
