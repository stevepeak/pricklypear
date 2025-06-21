// tests/mocks/supabaseClientMock.ts
// A lightweight, chain-friendly mock for the Supabase JS v2 client. Only the
// subset of the API used by our Deno edge functions is implemented. For all
// other calls it will return dummy/no-op handlers so nothing ever touches the
// network.

export type QueryResult<T = unknown> = {
  data: T | null;
  error: unknown | null;
};

// Helper that builds a chain-friendly proxy around `result`.
function createQueryBuilder<T>(result: QueryResult<T>) {
  const chain: Record<string, unknown> = {};
  const terminators = new Set(['single', 'maybeSingle', 'then', 'download']);

  return new Proxy(chain, {
    get(_target, prop) {
      // Support awaiting the builder directly (rare but possible)
      if (prop === 'then') {
        return (
          resolve: (v: QueryResult<T>) => void,
          _reject: (e: unknown) => void,
        ) => resolve(result);
      }

      if (terminators.has(String(prop))) {
        return () => Promise.resolve(result);
      }

      // All other methods just return the chain to allow infinite chaining.
      return () => chain;
    },
  });
}

// ---- configuration & factory ------------------------------------------------

export interface MockSupabaseConfig {
  /** Per-table canned responses */
  tables?: Record<string, QueryResult>;
  /** Auth user returned from `supabase.auth.getUser()` */
  authUser?: { id: string } | null;
  /** Result for `supabase.storage.from(bucket).download(path)` */
  storageDownload?: QueryResult<Blob>;
}

export function createMockSupabaseClient(cfg: MockSupabaseConfig = {}) {
  const tableResult = (table: string): QueryResult =>
    cfg.tables?.[table] ?? { data: null, error: null };

  return {
    // -------- database --------
    from(table: string) {
      return createQueryBuilder(tableResult(table));
    },

    // -------- storage --------
    storage: {
      from(_bucket: string) {
        return {
          download: (_path: string) =>
            Promise.resolve(cfg.storageDownload ?? { data: null, error: null }),
        };
      },
    },

    // -------- auth --------
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: cfg.authUser ?? null }, error: null }),
    },
  } as unknown;
}
