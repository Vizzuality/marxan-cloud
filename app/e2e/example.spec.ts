import { test, expect } from '@playwright/test';

test('About page', async ({ page }) => {
  await page.goto('/about');

  await expect(page).toHaveTitle(/About/);
});
