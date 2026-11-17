import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@apps': resolve(import.meta.dirname, './src/apps'),
      '@modules': resolve(import.meta.dirname, './src/context/modules'),
      '@shared': resolve(import.meta.dirname, './src/context/shared'),
    },
  },
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tests/**/*.test.ts'],
    environment: 'node',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.d.ts',
        'src/apps/backend/config/**',
        // 'src/infrastructure/Http/ExpressApp.ts',
        // 'src/infrastructure/Http/StatusCode.ts',
        // 'src/index.ts',
        'src/performance/**/*.js',
      ],
    },
  },
});
