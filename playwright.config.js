import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  use: {
    baseURL: 'http://localhost:2222',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run build && npm run sync:demo && npx vite --config vite.demo.config.js',
    url: 'http://localhost:2222/',
    reuseExistingServer: !process.env.CI,
  },
});
