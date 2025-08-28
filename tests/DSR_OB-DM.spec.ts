import { expect } from '@playwright/test';
import { test } from './test-data/dbFixture';
import { getSingleValue } from './test-data/dbUtils';
import testData from './test-data/testData.json';

test('Login and check DB values (OB + DM)', async ({ page, territory }) => {
  test.setTimeout(120000); // extend test timeout to 2 minutes

  // --- Generate two unique DSR codes ---
  const dsrOB = await getSingleValue(
    `DECLARE @CHECKDSR VARCHAR(10);
     SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));
     WHILE EXISTS (
       SELECT 1 FROM DSR WHERE DSR = @CHECKDSR AND distributor = '${testData.distributorId}'
     )
     BEGIN
       SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));
     END;
     SELECT @CHECKDSR AS DSR;`,
    'DSR'
  );

  const dsrDM = await getSingleValue(
    `DECLARE @CHECKDSR VARCHAR(10);
     SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));
     WHILE EXISTS (
       SELECT 1 FROM DSR WHERE DSR = @CHECKDSR AND distributor = '${testData.distributorId}'
     )
     BEGIN
       SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));
     END;
     SELECT @CHECKDSR AS DSR;`,
    'DSR'
  );

  // ---------------- LOGIN ----------------
  await page.goto(testData.baseUrl);
  await page.waitForLoadState('networkidle'); // wait for page & resources fully loaded

  const distributorInput = page.getByPlaceholder('Enter Distributor Id');
  await distributorInput.waitFor({ state: 'visible', timeout: 15000 });
  await distributorInput.fill(testData.distributorId);
  await page.waitForTimeout(2500);

  const userIdInput = page.getByPlaceholder('Enter User Id');
  await userIdInput.waitFor({ state: 'visible', timeout: 10000 });
  await userIdInput.fill(testData.userId);
  await page.waitForTimeout(2500);

  const passwordInput = page.getByPlaceholder('Enter User Password');
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.fill(testData.password);
  await page.waitForTimeout(2500);

  const signInBtn = page.getByRole('button', { name: 'Sign-In' });
  await signInBtn.waitFor({ state: 'visible', timeout: 10000 });
  await signInBtn.click();
  await page.waitForTimeout(2500);

  // ---------------- ADD DSR - OB ----------------
  await page.locator('a', { hasText: 'Main Menu' }).waitFor({ state: 'visible', timeout: 15000 });
  await page.locator('a', { hasText: 'Main Menu' }).click();

  await page.getByPlaceholder('Search').fill('order booker');
  await page.waitForTimeout(2500);
  await page.getByText('Setups,DSR,Order BookerSetups').click();

  await page.getByRole('button', { name: 'Add' }).click();
await page.waitForTimeout(2500);
  const codeInput1 = page.locator('#ctl00_cphMainContent_txtCode');
  await codeInput1.waitFor({ state: 'visible', timeout: 10000 });
  await page.waitForTimeout(2500);
  await codeInput1.fill(dsrOB);

  test.info().annotations.push({ type: 'dsrCode_OB', description: dsrOB });
await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtName').fill('test');
  await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtNIC').fill('321');
await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtDOB_btnImage').click();
  await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtDOB_ctl00_prevArrow').click();
  await page.getByTitle(/Tuesday, February 04/).click();
  await page.waitForTimeout(2500);

  await page.locator('#ctl00_cphMainContent_ddlTM').selectOption(territory);
  await page.waitForTimeout(2500);

  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(2500);
  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2500);
  console.log(`DSR-OB: ${dsrOB}`);

  // ---------------- ADD DSR - DM ----------------
  await page.locator('a', { hasText: 'Main Menu' }).click();
  await page.waitForTimeout(2500);
  await page.getByPlaceholder('Search').fill('delivery man');
  await page.waitForTimeout(2500);
  await page.getByText('Setups,DSR,Delivery ManSetups').click();

  await page.getByRole('button', { name: 'Add' }).click();

  const codeInput2 = page.locator('#ctl00_cphMainContent_txtCode');
  await codeInput2.waitFor({ state: 'visible', timeout: 10000 });
  await codeInput2.fill(dsrDM);
  await page.waitForTimeout(2500);

  test.info().annotations.push({ type: 'dsrCode_DM', description: dsrDM });
await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtName').fill('test');
  await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtNIC').fill('321');
  await page.waitForTimeout(2500);

  await page.locator('#ctl00_cphMainContent_txtDOB_btnImage').click();
  await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_txtDOB_ctl00_prevArrow').click();
  await page.getByTitle(/Tuesday, February 04/).click();

  await page.waitForTimeout(2500);
  await page.locator('#ctl00_cphMainContent_ddlTM').selectOption(territory);
  await page.waitForTimeout(2500);

  await page.getByRole('button', { name: 'Save' }).click();
  await page.waitForTimeout(2500);
  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2500);
  console.log(`DSR-DM: ${dsrDM}`);
});
