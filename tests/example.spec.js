// @ts-check
import { test, expect } from '@playwright/test';

test('Google search for Gemini CLI and screenshot', async ({ page }) => {
  await page.goto('https://www.google.com');
  await page.getByLabel('Search').fill('Gemini CLI');
  await page.getByLabel('Google Search').first().click();
  await page.screenshot({ path: 'screenshot-gemini-cli.png' });
  await expect(page).toHaveTitle(/Gemini CLI/);
});
