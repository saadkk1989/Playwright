import { test, expect } from '@playwright/test';
import { runQuery, closeConnection } from './dbUtils';

test.setTimeout(300000); // 5 minutes

test('Complete workflow with DB validation', async ({ page }) => {
  // --- Config ---
  const BASE_URL = 'http://128.1.103.4/Ver73_HICO_NDB';
  const DELAY_MS = 2000;
  const delay = () => page.waitForTimeout(DELAY_MS);

  let bankId = '85'; // or random generator
  const MAX_RETRIES = 3;

  // --- 1. Navigate & Login ---
  await page.goto(`${BASE_URL}/Default.aspx`);
  await delay();
  await login(page);

  // --- 2. Navigate to Bank Setup ---
  await navigateToBankSetup(page);

  // --- 3. Create Bank Record (with retry) ---
  let retryCount = 0;
  while (retryCount <= MAX_RETRIES) {
    try {
      await attemptBankRecordCreation(page, bankId);
      break; // success
    } catch (error) {
      retryCount++;
      if (retryCount > MAX_RETRIES) throw error;

      bankId = Math.floor(10 + Math.random() * 90).toString();
      console.log(`Retry ${retryCount}: Trying with Bank ID ${bankId}`);
      await page.reload();
      await delay();
      await navigateToBankSetup(page);
    }
  }

// --- 4. ✅ DB Validation ---
const query = `SELECT TOP 1 * FROM Bank WHERE Bank = '${bankId}'`;
const result = await runQuery(query);

console.log("DB Query Result:", result);

expect(result.length).toBeGreaterThan(0);

// Use the exact column name casing returned by SQL
expect(result[0].BANK.toString()).toBe(bankId);

console.log("✅ DB Validation Success:", result[0]);



  // --- 5. Logout & Cleanup ---
  await logout(page);
  await closeConnection();

  // --- Helpers ---
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

    await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 10000 });
  }

  async function logout(page) {
    await page.locator('#optionBtn').click();
    await delay();
    await page.getByRole('link', { name: 'Logout' }).click();
    await delay();
    await expect(page).toHaveURL(/Default\.aspx/);
  }
});
