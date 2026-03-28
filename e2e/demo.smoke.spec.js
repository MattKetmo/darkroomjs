import { test, expect } from '@playwright/test';

test('demo root loads with ImgTor UI and Darkroom', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.ok()).toBeTruthy();

  await expect(page.locator('h1')).toContainText('ImgTor');
  await expect(page.locator('#target')).toBeAttached();

  await expect.poll(async () => page.evaluate(() => typeof window.Darkroom)).toBe('function');
});
