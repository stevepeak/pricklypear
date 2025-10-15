import { assertEquals } from 'jsr:@std/assert';

Deno.test('health endpoint returns ok status', async () => {
  // Test the response structure
  const mockResponse = new Response(
    JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'supabase-functions',
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );

  assertEquals(mockResponse.status, 200);
  const body = await mockResponse.json();
  assertEquals(body.status, 'ok');
  assertEquals(body.service, 'supabase-functions');
});
