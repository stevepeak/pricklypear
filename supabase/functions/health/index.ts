import { res } from '../utils/response.ts';

Deno.serve(async () => {
  return res.ok({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'supabase-functions',
  });
});
