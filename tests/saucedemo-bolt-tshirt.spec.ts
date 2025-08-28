import { test, expect } from '@playwright/test';

test('Login and verify Sauce Labs Bolt T-Shirt is listed', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await page.waitForTimeout(2000); // 2-second delay

  await page.fill('#user-name', 'standard_user');
  await page.waitForTimeout(2000); // 2-second delay

  await page.fill('#password', 'secret_sauce');
  await page.waitForTimeout(2000); // 2-second delay

  await page.click('#login-button');
  await page.waitForTimeout(2000); // 2-second delay

  await expect(page.locator('.inventory_item_name', { hasText: 'Sauce Labs Bolt T-Shirt' })).toBeVisible();
  // Click 'Add to cart' for Sauce Labs Bolt T-Shirt
  const boltTShirtItem = page.locator('.inventory_item').filter({ has: page.locator('.inventory_item_name', { hasText: 'Sauce Labs Bolt T-Shirt' }) });
  await boltTShirtItem.locator('button:has-text("Add to cart")').click();
  await page.waitForTimeout(1000);
  // Verify 'Remove' button is now visible for Sauce Labs Bolt T-Shirt
  await expect(boltTShirtItem.locator('button:has-text("Remove")')).toBeVisible();
});
