import { test, expect } from '@playwright/test';

test('Add Sony vaio i5 laptop to cart on Demoblaze', async ({ page }) => {
  await page.goto('https://www.demoblaze.com');
  await page.waitForTimeout(2000);
  // Click on 'Laptops' in Categories
  await page.getByRole('link', { name: 'Laptops' }).click();
  await page.waitForTimeout(2000);
  // Click on 'Sony vaio i5'
  await page.getByRole('link', { name: 'Sony vaio i5' }).click();
  await page.waitForTimeout(2000);
  // Click on 'Add to cart' button
  await page.getByRole('link', { name: 'Add to cart' }).click();
  await page.waitForTimeout(2000);
  // Wait for and accept the alert popup
  await page.waitForEvent('dialog').then(dialog => dialog.accept());
  await page.waitForTimeout(2000);
});
