import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Stock Adjustment Workflow with Delays', async ({ page }) => {
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

  // 4. Adjustment entry process
  await page.getByRole('textbox', { name: 'Search' }).click();
  await delay();
  await page.getByRole('textbox', { name: 'Search' }).fill('adjustment');
  await delay();
  await page.getByText('Transactions,Adjustments,Entry-AdminTransactions Adjustments Entry-admin').click();
  await delay();

  // 5. Create adjustment with retry logic
  let retryCount = 0;
  const maxRetries = 3;
  let success = false;
  let documentNumber: string | null = null;

  while (retryCount <= maxRetries && !success) {
    try {
      await createAdjustment(page);
      success = true;
      
      // 6. Verify successful creation and extract document number
      const successElement = page.getByText('Stock Adjustment Note#:');
      await expect(successElement).toBeVisible();
      await delay();
      
      // Extract the document number
      const successText = await successElement.textContent();
      documentNumber = successText?.match(/Stock Adjustment Note#: (\d+)/)?.[1] || null;
      
      if (documentNumber) {
        console.log(`Captured Stock Adjustment Note#: ${documentNumber}`);
        
        // Save to a file for use in other tests
        const dataDir = path.join(__dirname, 'test-data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir);
        }
        fs.writeFileSync(path.join(dataDir, 'adjustment-note.txt'), documentNumber);
        
        // Also store in process.env for immediate use
        process.env.LAST_ADJUSTMENT_NOTE = documentNumber;
      } else {
        console.warn('Could not extract document number from success message');
      }
      
    } catch (error) {
      retryCount++;
      if (retryCount > maxRetries) throw error;
      
      console.log(`Retry ${retryCount}: Attempting adjustment again...`);
      await page.reload();
      await delay();
      
      // If we're still on the adjustment page, continue
      if (await page.getByRole('button', { name: 'Insert' }).isVisible()) {
        continue;
      }
      
      // Otherwise navigate back
      await page.locator('a').filter({ hasText: 'Main Menu' }).click();
      await delay();
      await page.getByRole('textbox', { name: 'Search' }).fill('adjustment');
      await delay();
      await page.getByText('Transactions,Adjustments,Entry-AdminTransactions Adjustments Entry-admin').click();
      await delay();
    }
  }

  if (!documentNumber) {
    throw new Error('Failed to capture document number after successful creation');
  }

  async function createAdjustment(page) {
    await page.locator('#ctl00_txtComments').click();
    await delay();
    await page.locator('#ctl00_txtComments').fill('123');
    await delay();
    await page.locator('#ctl00_detailGrid_ctl5001_txtSKU').click();
    await delay();
    await page.locator('#ctl00_detailGrid_ctl5001_txtSKU').fill('H100012');
    await delay();
    await page.locator('#ctl00_detailGrid_ctl5001_txtQty3').click();
    await delay();
    await page.locator('#ctl00_detailGrid_ctl5001_txtQty3').click();
    await delay();
    await page.locator('#ctl00_detailGrid_ctl5001_txtQty3').click();
    await delay();
    await page.locator('#ctl00_detailGrid_ctl5001_txtQty3').fill('10');
    await delay();
    await page.getByRole('button', { name: 'Insert' }).click();
    await delay();
    await page.getByRole('button', { name: 'Validate' }).click();
    await delay();
    await page.getByRole('button', { name: 'Save Document' }).click();
    await delay();
  }
});