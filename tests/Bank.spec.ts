import { test, expect } from '@playwright/test';
import { runQuery, closeConnection } from './dbUtils';

test('Complete workflow with smart retries', async ({ page }) => {
  test.setTimeout(300000); // 5 minute timeout

  // Configuration
  const MAX_RETRIES = 3;
  const DELAY_MS = 2000;
  const BASE_URL = 'http://128.1.103.4/Ver73_HICO_NDB';

  // Helper functions
  const delay = () => page.waitForTimeout(DELAY_MS);
  const generateRandomBankId = () => Math.floor(10 + Math.random() * 90).toString();

  // 1. Navigate and login
  await page.goto(`${BASE_URL}/Default.aspx`);
  await delay();
  await login(page);

  // 2. Navigate to bank setup
  await navigateToBankSetup(page);

  // 3. Create bank record with smart retries
  let retryCount = 0;
  let bankId = '85'; // Start with default ID
  
  while (retryCount <= MAX_RETRIES) {
    try {
      await attemptBankRecordCreation(page, bankId);
      break; // Exit loop if successful
    } catch (error) {
      retryCount++;
      if (retryCount > MAX_RETRIES) throw error;
      
      // Generate new bank ID for retry
      bankId = generateRandomBankId();
      console.log(`Retry ${retryCount}: Using new Bank ID ${bankId}`);
      
      // Smart recovery - refresh current page
      await page.reload();
      await delay();
      
      // If we're on the bank setup page, just click Add again
      if (await page.getByRole('button', { name: 'Add' }).isVisible()) {
        continue;
      }
      
      // Otherwise navigate back to bank setup
      await navigateToBankSetup(page);
    }
  }

  // 4. Logout
  await logout(page);

  async function login(page) {
    await page.getByRole('textbox', { name: 'Distributor Id' }).fill('000002');
    await delay();
    await page.getByRole('textbox', { name: 'USER Id' }).fill('admin');
    await delay();
    await page.getByRole('textbox', { name: 'Password' }).fill('admin');
    await delay();
    await page.getByRole('button', { name: 'Sign-In' }).click();
    await delay();
    await expect(page).not.toHaveURL(/Default\.aspx/);
  }

  async function navigateToBankSetup(page) {
    await page.locator('a').filter({ hasText: 'Main Menu' }).click();
    await delay();
    await page.getByRole('textbox', { name: 'Search' }).fill('bank');
    await delay();
    await page.getByText('Setups,Bank,BankSetups Bank').click();
    await delay();
  }

  async function attemptBankRecordCreation(page, bankId) {
    // Check if we're already on the add record page
    if (!(await page.locator('#ctl00_cphMainContent_txtPCBank').isVisible())) {
      await page.getByRole('button', { name: 'Add' }).click();
      await delay();
    }
    
    await page.locator('#ctl00_cphMainContent_txtPCBank').fill(bankId);
    await delay();
    await page.locator('#ctl00_cphMainContent_txtPCSDesc').fill('test');
    await delay();
    await page.locator('#ctl00_cphMainContent_txtPCLDesc').fill('test1');
    await delay();
    await page.getByRole('button', { name: 'Save' }).click();
    await delay();
    
    // Verify save
    await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 10000 });
  }


// --- 5. ✅ DB Validation ---
const query = `SELECT TOP 1 * FROM Bank WHERE Bank = '${bankId}'`;
const result = await runQuery(query);

console.log("DB Query Result:", result);

expect(result.length).toBeGreaterThan(0);

// Use the exact column name casing returned by SQL
expect(result[0].BANK.toString()).toBe(bankId);

console.log("✅ DB Validation Success:", result[0]);

  async function logout(page) {
    await page.locator('#optionBtn').click();
    await delay();
    await page.getByRole('link', { name: 'Logout' }).click();
    await delay();
    await expect(page).toHaveURL(/Default\.aspx/);
  }
});
