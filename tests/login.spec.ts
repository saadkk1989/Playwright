import { expect } from '@playwright/test';
import { test } from './test-data/dbFixture';
import testData from './test-data/testData.json';


test('Login and check DB values', async ({ page, sellCategory, warehouse, warehouses, pop, year, bank, territory, dsr }) => {
  // UI login
  await page.goto(testData.baseUrl);
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Enter Distributor Id').fill(testData.distributorId);
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Enter User Id').fill(testData.userId);
  await page.waitForTimeout(2000);

  await page.getByPlaceholder('Enter User Password').fill(testData.password);
  await page.waitForTimeout(2000);

  await page.getByRole('button', { name: 'Sign-In' }).click();
  await page.waitForTimeout(2000);

  // Use variables fetched from DB
  console.log('Sell Category:', sellCategory);
  console.log('Warehouse:', warehouse);
  console.log('Warehouse 1:', warehouses[0]);
  console.log('Warehouse 2:', warehouses[1]);
  console.log('POP 1:', pop[0]);
  console.log('POP 2:', pop[1]);
  console.log('Year:', year);
  console.log('Bank:', bank);
  console.log('Territory:', territory);
  console.log('DSR:', dsr);
  console.log('Sell_Category:', sell_category);
  console.log('Section:', section);

  // Example validations
  expect(sellCategory).not.toBeNull();
  expect(warehouse).not.toBeNull();
  expect(warehouses.length).toBeGreaterThan(0);
  expect(pop.length).toBeGreaterThan(0);
  expect(year).toMatch(/^\d{4}$/); // Must be a 4-digit year
  expect(bank).not.toBeNull();
  expect(territory).not.toBeNull();
  expect(dsr).not.toBeNull();
  expect(section).not.toBeNull();
});
