import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: [
      'tests/e2e/**',
      'node_modules/**',
      'supabase/**',
      'react-email/node_modules/**',
    ],
    globals: true,
  },
});
