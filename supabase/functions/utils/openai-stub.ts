// Stub for the `openai` package used in Deno tests.
export default class OpenAI {
  // deno-lint-ignore no-explicit-any
  constructor(_config: any) {}
  embeddings = {
    // deno-lint-ignore no-explicit-any
    create: async (_args: any): Promise<any> => ({ data: [{ embedding: [] }] }),
  };
}
