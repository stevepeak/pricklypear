// Minimal test bootstrap for Deno edge-function tests.
// Provide missing Node globals and ensure the stubbed `env` module is loaded
// before any handler code.

// Provide a fake `process.env` so npm packages that access it don’t trigger the
// Deno `--allow-env` permission check.
(globalThis as unknown as { process?: unknown }).process = {
  env: new Proxy(
    {},
    {
      // deno-lint-ignore no-unused-vars
      get: (_target, _prop) => undefined,
    }
  ),
};

// Load the stubbed env implementation.
import './utils/env.ts';
