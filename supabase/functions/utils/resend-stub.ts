export class Resend {
  // deno-lint-ignore no-explicit-any
  constructor(_key?: any) {}

  emails = {
    // deno-lint-ignore no-explicit-any
    send: async (_args: any): Promise<any> =>
      ({ id: 'email-stub', error: null }) as any,
  };
}
