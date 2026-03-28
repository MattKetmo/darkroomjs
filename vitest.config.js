import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['lib/js/**/*.js', 'lib/entry-darkroom.js'],
      all: true,
      reporter: ['text', 'json-summary', 'html', 'lcov'],
      reportsDirectory: './coverage',
      // Non-regression floor (PR-02 raises this after more unit tests land).
      thresholds: {
        lines: 1,
        branches: 2,
        statements: 1,
        functions: 2,
      },
    },
  },
});
