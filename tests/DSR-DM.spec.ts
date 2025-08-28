import { expect } from '@playwright/test';
import { test } from './test-data/dbFixture';
import testData from './test-data/testData.json';

test('Login and check DB values', async ({ page, dsr, territory }) => {
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

  // Search order booker
  const searchBox = page.getByPlaceholder('Search');
  await expect(searchBox).toBeVisible();
  await searchBox.click();
  await searchBox.fill('delivery man');
  await page.waitForTimeout(2000);

  const orderBookerMenu = page.getByText('Setups,DSR,Delivery ManSetups');
  await expect(orderBookerMenu).toBeVisible({ timeout: 15000 });
  await orderBookerMenu.click();
  await page.waitForTimeout(2000);

  // Add new DSR
  const addBtn = page.getByRole('button', { name: 'Add' });
  await expect(addBtn).toBeVisible();
  await addBtn.click();
  await page.waitForTimeout(2000);

  const codeInput = page.locator('#ctl00_cphMainContent_txtCode');
  await expect(codeInput).toBeVisible();
  await codeInput.click();
  await codeInput.fill(dsr);
  await page.waitForTimeout(2000);
  
   // ✅ Save DSR into variable for future test use
  const createdDSR = dsr;
  test.info().annotations.push({ type: 'dsrCode', description: createdDSR });
  

  const nameInput = page.locator('#ctl00_cphMainContent_txtName');
  await expect(nameInput).toBeVisible();
  await nameInput.click();
  await nameInput.fill('test');
  await page.waitForTimeout(3000);

  const nicInput = page.locator('#ctl00_cphMainContent_txtNIC');
  await expect(nicInput).toBeVisible();
  await nicInput.click();
  await nicInput.fill('321');
  await page.waitForTimeout(3000);

  // Select Date of Birth
  const dobButton = page.locator('#ctl00_cphMainContent_txtDOB_btnImage');
  await expect(dobButton).toBeVisible();
  await dobButton.click();
  await page.waitForTimeout(3000);

  const prevArrow = page.locator('#ctl00_cphMainContent_txtDOB_ctl00_prevArrow');
  await expect(prevArrow).toBeVisible();
  await prevArrow.click();
  await page.waitForTimeout(3000);

  const dobDate = page.getByTitle(/Tuesday, February 04/);
  await expect(dobDate).toBeVisible();
  await dobDate.click();
  await page.waitForTimeout(3000);

  // Select Territory/Dropdown using fixture value
 
  const tmDropdown = page.locator('#ctl00_cphMainContent_ddlTM');
  await expect(tmDropdown).toBeVisible();
  await tmDropdown.selectOption(territory);
  await page.waitForTimeout(1000);

  // Save
  const saveBtn = page.getByRole('button', { name: 'Save' });
  await expect(saveBtn).toBeVisible();
  await saveBtn.click();
  await page.waitForTimeout(3000);

  // Verify record saved message
  const successMsg = page.getByText('Record has been saved');
  await expect(successMsg).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(2000);
  
  console.log(`DSR-DM: ${createdDSR}`);
  
});
