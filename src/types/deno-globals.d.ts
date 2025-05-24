declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  [key: string]: unknown;
};
