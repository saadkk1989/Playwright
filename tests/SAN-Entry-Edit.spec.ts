import { test, expect } from '@playwright/test';

test('Create and Edit Stock Adjustment with Pagination Support', async ({ page }) => {
  test.setTimeout(600000); // 10 minute timeout
  
  // Utility functions
  const delay = (ms = 2000) => page.waitForTimeout(ms);
  const log = (msg: string) => console.log(`[${new Date().toISOString()}] ${msg}`);
  const error = (msg: string) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`);

  let documentNumber: string | null = null;

  try {
    // === LOGIN ===
    log('Navigating to application and logging in');
    await page.goto('http://128.1.103.4/Ver73_HICO_NDB/Default.aspx');
    await delay();
    await page.getByRole('textbox', { name: 'Distributor Id' }).fill('000002');
    await page.getByRole('textbox', { name: 'USER Id' }).fill('admin');
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await page.getByRole('button', { name: 'Sign-In' }).click();
    await delay(3000);

    // === CREATE ADJUSTMENT ===
    log('Creating new stock adjustment');
    await page.locator('a', { hasText: 'Main Menu' }).click();
    await delay();
    await page.getByRole('textbox', { name: 'Search' }).fill('adjustment');
    await delay();
    await page.getByText('Transactions,Adjustments,Entry-AdminTransactions Adjustments Entry-admin').click();
    await delay();

    await page.locator('#ctl00_txtComments').fill('Playwright test');
    await page.locator('#ctl00_detailGrid_ctl5001_txtSKU').fill('H100012');
    await page.locator('#ctl00_detailGrid_ctl5001_txtQty3').fill('10');
    await page.getByRole('button', { name: 'Insert' }).click();
    await delay();
    await page.getByRole('button', { name: 'Validate' }).click();
    await delay(5000);
    await page.getByRole('button', { name: 'Save Document' }).click();
    await delay(8000);

    const successElement = page.getByText('Stock Adjustment Note#:');
    await expect(successElement).toBeVisible({ timeout: 15000 });
    const successText = await successElement.textContent();
    documentNumber = successText?.match(/Stock Adjustment Note#: (\d+)/)?.[1] || null;
    if (!documentNumber) throw new Error('Could not extract document number');
    log(`✅ Created Adjustment: ${documentNumber}`);

    // === EDIT ADJUSTMENT ===
    log('Navigating to edit screen');
    await page.locator('a', { hasText: 'Main Menu' }).click();
    await delay();
    await page.getByRole('textbox', { name: 'Search' }).fill('adjust');
    await delay();
    await page.getByText('Transactions,Adjustments,Edit-AdminTransactions Adjustments Edit-admin').click();
    await delay(5000);

    // === SEARCH DOCUMENT ===
    log(`Searching for document ${documentNumber}`);
    const found = await searchDocument(page, documentNumber, delay, log);
    if (!found) {
      await page.screenshot({ path: 'search-failure.png' });
      throw new Error(`Document ${documentNumber} not found`);
    }

    // === PERFORM EDIT ===
    log('Editing document');
    await page.getByRole('button', { name: 'Edit' }).click({ timeout: 15000 });
    await delay();
    await page.locator('input[id*="txtQty3"]').first().fill('2');
    await delay();
    await page.getByRole('button', { name: 'Update' }).click();
    await delay();
    await page.getByRole('button', { name: 'Save Document' }).click();
    await delay(5000);
    await expect(page.getByText('Stock Adjustment Note#:')).toBeVisible();
    log(`✏️ Successfully edited document ${documentNumber}`);

  } catch (err: any) {
    error(`Test failed: ${err.message}`);
    try {
      if (!page.isClosed()) {
        await page.screenshot({ path: 'test-failure.png', fullPage: true });
        log('🖼️ Screenshot saved: test-failure.png');
      }
    } catch (screenshotErr) {
      error(`Failed to take screenshot: ${screenshotErr}`);
    }
    throw err;
  }
});

// Document search with pagination support
async function searchDocument(page: any, docNumber: string, delayFn: Function, logFn: Function): Promise<boolean> {
  const MAX_PAGES = 5;
  let currentPage = 1;

  while (currentPage <= MAX_PAGES) {
    logFn(`Checking page ${currentPage} for document ${docNumber}`);

    // Check if document exists in current page
    const docLink = page.locator(`a:has-text("${docNumber}")`).first();
    if (await docLink.count() > 0) {
      await docLink.click();
      return true;
    }

    // Check if next page exists
    const nextPageBtn = page.locator('tr.paginationGrid a', { hasText: (currentPage + 1).toString() });
    if (await nextPageBtn.count() > 0) {
      logFn(`Moving to page ${currentPage + 1}`);
      await nextPageBtn.click();
      await delayFn(3000);
      currentPage++;
    } else {
      break;
    }
  }

  return false;
}