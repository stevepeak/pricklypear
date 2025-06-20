import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Stub React-Native when running in Vitest so `.flow` files aren’t parsed
      'react-native': resolve(__dirname, './src/__mocks__/react-native.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'node_modules/**'],
    globals: true,
  },
});
