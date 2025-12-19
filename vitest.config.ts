import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
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
      'react-email/**',
    ],
    globals: true,
  },
});
