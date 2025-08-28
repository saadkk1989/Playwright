import { expect } from '@playwright/test';
import { test } from './test-data/dbFixture';
import { getSingleValue } from './test-data/dbUtils';
import testData from './test-data/testData.json';

test('Login and check DB values (OB + DM + Section + PJP)', async ({ page, territory, sellCategory, section, PJPOB, PJPDM }) => {

  test.setTimeout(150000); // extend test timeout to 2.5 minutes

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
  await page.waitForLoadState('networkidle');

  await expect(page.getByPlaceholder('Enter Distributor Id')).toBeVisible({ timeout: 15000 });
  await page.getByPlaceholder('Enter Distributor Id').fill(testData.distributorId);
    await page.waitForTimeout(1000);
  await expect(page.getByPlaceholder('Enter User Id')).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder('Enter User Id').fill(testData.userId);
    await page.waitForTimeout(1000);
  await expect(page.getByPlaceholder('Enter User Password')).toBeVisible({ timeout: 10000 });
  await page.getByPlaceholder('Enter User Password').fill(testData.password);
    await page.waitForTimeout(1000);
  await expect(page.getByRole('button', { name: 'Sign-In' })).toBeVisible({ timeout: 10000 });
  await page.getByRole('button', { name: 'Sign-In' }).click();
      await page.waitForTimeout(1000);

  const mainMenu = page.locator('a', { hasText: 'Main Menu' });
  await expect(mainMenu).toBeVisible({ timeout: 15000 });

  // ---------------- ADD DSR - OB ----------------
  await mainMenu.click();
  await page.getByPlaceholder('Search').fill('order booker');
      await page.waitForTimeout(1000);
  await page.getByText('Setups,DSR,Order BookerSetups').click();
    await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Add' }).click();
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtCode').fill(dsrOB);
      await page.waitForTimeout(1000);
  test.info().annotations.push({ type: 'dsrCode_OB', description: dsrOB });
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtName').fill('test');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtNIC').fill('321');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtDOB_btnImage').click();
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtDOB_ctl00_prevArrow').click();
        await page.waitForTimeout(1000);
  await page.getByTitle(/Tuesday, February 04/).click();
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_ddlTM').selectOption(territory);
        await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(1000);

  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
  console.log(`DSR-OB: ${dsrOB}`);

  // ---------------- ADD DSR - DM ----------------
  await mainMenu.click();
  await page.getByPlaceholder('Search').fill('delivery man');
      await page.waitForTimeout(1000);
  await page.getByText('Setups,DSR,Delivery ManSetups').click();
    await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Add' }).click();
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtCode').fill(dsrDM);
        await page.waitForTimeout(1000);
  test.info().annotations.push({ type: 'dsrCode_DM', description: dsrDM });
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtName').fill('test');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtNIC').fill('321');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtDOB_btnImage').click();
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtDOB_ctl00_prevArrow').click();
        await page.waitForTimeout(1000);
  await page.getByTitle(/Tuesday, February 04/).click();
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_ddlTM').selectOption(territory);
        await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Save' }).click();
      await page.waitForTimeout(1000);

  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
  console.log(`DSR-DM: ${dsrDM}`);

  // ---------------- ADD SECTION ----------------
  await mainMenu.click();
  await page.getByPlaceholder('Search').fill('section');
      await page.waitForTimeout(1000);
  await page.getByText('Setups,PJP,SectionSetups Pjp').click();
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtSection').fill(section);
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtPCSDesc').fill('test');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtPCLDesc').fill('test1');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_ddlStatus').selectOption('Yes');
        await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(1000);
  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
  console.log('Section:', section);
  await page.waitForTimeout(2000);

// ---------------- ADD PJP - OB ----------------
await page.locator('#mainMenuContainer').getByRole('link').click();
  await page.waitForTimeout(2000);
  await page.locator('a').filter({ hasText: 'Main Menu' }).click();
    await page.waitForTimeout(1000);
  await page.getByPlaceholder('Search').click();
  await page.getByPlaceholder('Search').fill('pjp');
        await page.waitForTimeout(1000);
  await page.getByText('Setups,PJP,PJPSetups Pjp Pjp').click();
        await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Create New PJP' }).click();

        await page.waitForTimeout(1000);

  await page.locator('#ctl00_cphMainContent_txtPJPNo').fill(PJPOB);
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_ddlDSR').selectOption(dsrOB);
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtSdesc').fill('OB');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtLdesc').fill('OB');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtCreditAmount').fill('500');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_detailGrid_ctl5001_ddlSection').selectOption(section);
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_detailGrid_ctl5001_txtCode').fill('1');
      await page.waitForTimeout(1000);
  // Select all days
  for (const day of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']) {
    await page.locator(`#ctl00_cphMainContent_detailGrid_ctl5001_chk${day}`).check();
  }
    await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: 'Insert' }).click();
      await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Save Transaction' }).click();
      await page.waitForTimeout(7000);

  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000);
  await expect(page.getByText(/PJP#:/)).toBeVisible({ timeout: 15000 });

  console.log('PJP-OB:', PJPOB);
  
  
  // ---------------- ADD PJP - DM ----------------

  await page.locator('a').filter({ hasText: 'Main Menu' }).click();
    await page.waitForTimeout(1000);
  await page.getByPlaceholder('Search').click();
  await page.getByPlaceholder('Search').fill('pjp');
        await page.waitForTimeout(1000);
  await page.getByText('Setups,PJP,PJPSetups Pjp Pjp').click();
        await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Create New PJP' }).click();

        await page.waitForTimeout(1000);

  await page.locator('#ctl00_cphMainContent_txtPJPNo').fill(PJPDM);
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_ddlDSR').selectOption(dsrDM);
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtSdesc').fill('DM');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtLdesc').fill('DM');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_txtCreditAmount').fill('500');
        await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_detailGrid_ctl5001_ddlSection').selectOption(section);
      await page.waitForTimeout(1000);
  await page.locator('#ctl00_cphMainContent_detailGrid_ctl5001_txtCode').fill('1');
      await page.waitForTimeout(1000);
  // Select all days
  for (const day of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']) {
    await page.locator(`#ctl00_cphMainContent_detailGrid_ctl5001_chk${day}`).check();
  }
    await page.waitForTimeout(1000);
	 await page.locator('#ctl00_cphMainContent_detailGrid_ctl5001_ddlRefPJP').selectOption(PJPOB);
	
    await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: 'Insert' }).click();
      await page.waitForTimeout(1000);
  await page.getByRole('button', { name: 'Save Transaction' }).click();
      await page.waitForTimeout(5000);

  await expect(page.getByText('Record has been saved')).toBeVisible({ timeout: 15000 });
      await page.waitForTimeout(1000);
  await expect(page.getByText(/PJP#:/)).toBeVisible({ timeout: 15000 });

  console.log('PJP-DM:', PJPDM);
  
  
  
  
});
