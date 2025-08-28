import { expect } from '@playwright/test';
import { test } from './test-data/dbFixture';
import testData from './test-data/testData.json';

test('Login and check DB values', async ({ page, sellCategory, section }) => {
  test.setTimeout(120000); // extend test timeout to 2 minutes

  // UI login
  await page.goto(testData.baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const distributorInput = page.getByPlaceholder('Enter Distributor Id');
  await expect(distributorInput).toBeVisible();
  await distributorInput.fill(testData.distributorId);
  await page.waitForTimeout(2000);

  const userIdInput = page.getByPlaceholder('Enter User Id');
  await expect(userIdInput).toBeVisible();
  await userIdInput.fill(testData.userId);
  await page.waitForTimeout(2000);

  const passwordInput = page.getByPlaceholder('Enter User Password');
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(testData.password);
  await page.waitForTimeout(2000);

  const signInBtn = page.getByRole('button', { name: 'Sign-In' });
  await expect(signInBtn).toBeVisible();
  await signInBtn.click();
  await page.waitForTimeout(3000);

  // Wait until Main Menu is visible after login
  const mainMenu = page.locator('a', { hasText: 'Main Menu' });
  await expect(mainMenu).toBeVisible({ timeout: 15000 });
  await mainMenu.click();
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search').click();
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Search').fill('section');
  await page.waitForTimeout(2000);

  await page.getByText('Setups,PJP,SectionSetups Pjp').click();
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_txtSection').click();
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_txtSection').fill(section);
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_txtPCSDesc').click();
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_txtPCSDesc').fill('test');
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_txtPCLDesc').click();
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_txtPCLDesc').fill('test1');
  await page.waitForTimeout(2000);

  await page.locator('#ctl00_cphMainContent_ddlStatus').selectOption('Yes');
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(2000);

  await page.getByText('Record has been saved').click();
  await page.waitForTimeout(2000);
  
  console.log('Section:', section);
  
});
