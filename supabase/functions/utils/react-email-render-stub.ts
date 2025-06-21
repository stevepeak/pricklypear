/* eslint-disable @typescript-eslint/no-unused-vars */
// Stub replacement for the heavy `@react-email/render` package when executing
// Deno unit tests. We only need the `renderAsync` named export used by our
// helper in `email-render.ts`.
export async function renderAsync(_element: unknown): Promise<string> {
  return '<html><!-- mocked email --></html>';
}
