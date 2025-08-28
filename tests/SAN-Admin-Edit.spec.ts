import { test, expect } from '@playwright/test';

test('Stock Adjustment Edit Workflow with Delays', async ({ page }) => {
  test.setTimeout(300000); // 5 minute timeout

  // Helper function for consistent 2-second delays
  const delay = () => page.waitForTimeout(2000);

  // 1. Navigate to application
  await page.goto('http://128.1.103.4/Ver73_HICO_NDB/Default.aspx');
  await delay();

  // 2. Login process
  await page.getByRole('textbox', { name: 'Distributor Id' }).click();
  await delay();
  await page.getByRole('textbox', { name: 'Distributor Id' }).fill('000002');
  await delay();
  await page.getByRole('textbox', { name: 'USER Id' }).click();
  await delay();
  await page.getByRole('textbox', { name: 'USER Id' }).fill('admin');
  await delay();
  await page.getByRole('textbox', { name: 'Password' }).click();
  await delay();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin');
  await delay();
  await page.getByRole('button', { name: 'Sign-In' }).click();
  await delay();

  // 3. Main menu navigation
  await page.locator('a').filter({ hasText: 'Main Menu' }).click();
  await delay();

  // 4. Adjustment edit process
  await page.getByRole('textbox', { name: 'Search' }).click();
  await delay();
  await page.getByRole('textbox', { name: 'Search' }).fill('adjust');
  await delay();
  await page.getByText('Transactions,Adjustments,Edit-AdminTransactions Adjustments Edit-admin').click();
  await delay();

  // 5. Select adjustment to edit
  await page.getByRole('link', { name: '2', exact: true }).click();
  await delay();
  await page.getByRole('link', { name: '2025000022' }).click();
  await delay();

  // 6. Edit adjustment
  await page.getByRole('button', { name: 'Edit' }).click();
  await delay();
  await page.getByRole('row', { name: 'Update Cancel Stock Transfer' }).locator('#ctl00_detailGrid_ctl02_txtQty3').click();
  await delay();
  await page.getByRole('row', { name: 'Update Cancel Stock Transfer' }).locator('#ctl00_detailGrid_ctl02_txtQty3').fill('2');
  await delay();
  await page.getByRole('button', { name: 'Update' }).click();
  await delay();

  // 7. Save changes
  await page.getByRole('button', { name: 'Save Document' }).click();
  await delay();

  // 8. Verify successful update
  await expect(page.getByText('Stock Adjustment Note#:')).toBeVisible();
  await delay();
});