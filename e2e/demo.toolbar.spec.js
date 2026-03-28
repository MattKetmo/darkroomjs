import { test, expect } from '@playwright/test';

test('demo mounts toolbar with plugin button groups', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.ok()).toBeTruthy();

  await expect.poll(async () => page.evaluate(() => typeof window.Darkroom)).toBe('function');

  const toolbar = page.locator('.darkroom-toolbar');
  await expect(toolbar).toBeVisible();

  // History, rotate, crop, save — one group each after init
  await expect(toolbar.locator('.darkroom-button-group')).toHaveCount(4);

  // Demo calls crop.requireFocus() on init, so crop done/close are visible too:
  // undo, redo, rotate×2, crop, done, close, save = 8
  await expect(toolbar.locator('button.darkroom-button:not(.darkroom-button-hidden)')).toHaveCount(8);
});
