import { test as base } from '@playwright/test';
import { getSingleValue, getAllValues, getAllRows } from '../test-data/dbUtils';
import testData from '../test-data/testData.json';

// Extend the test object with custom fixtures
export const test = base.extend<{
  sellCategory: string;
  warehouse: string;
  warehouses: string[];
  pop: string[];
  year: string;
  bank: string;
  territory: string;
  dsrOB: string;
  dsrDM: string;
  section: string;

}>({
  // Fetch sellCategory
  sellCategory: async ({}, use) => {
    const value = await getSingleValue(
      `SELECT TOP 1 sell_category 
       FROM selling_category 
       WHERE company = '${testData.company}' 
         AND distributor = '${testData.distributorId}'`,
      'sell_category'
    );
    await use(value);
  },

  // Fetch single warehouse
  warehouse: async ({}, use) => {
    const value = await getSingleValue(
      `SELECT TOP 1 warehouse 
       FROM warehouse 
       WHERE company = '${testData.company}' 
         AND distributor = '${testData.distributorId}'`,
      'warehouse'
    );
    await use(value);
  },

  // Fetch multiple warehouses
  warehouses: async ({}, use) => {
    const values = await getAllValues(
      `SELECT TOP 2 warehouse 
       FROM warehouse 
       WHERE company = '${testData.company}' 
         AND distributor = '${testData.distributorId}'`,
      'warehouse'
    );
    await use(values);
  },

  // Fetch multiple POPs
  pop: async ({}, use) => {
    const rows = await getAllRows(
      `SELECT TOP 2 
         CAST([TOWN] AS VARCHAR(20)) +
         CAST([LOCALITY] AS VARCHAR(20)) +
         CAST([SLOCALITY] AS VARCHAR(20))+
         CAST([POP] AS VARCHAR(20))  AS POP_CODE
       FROM (
         SELECT DISTINCT [TOWN],[LOCALITY],[SLOCALITY],[POP]
         FROM pop
         WHERE ACTIVE = 1
           AND SUB_ELEMENT IS NOT NULL
           AND POPTYPE IS NOT NULL
           AND RANK IS NOT NULL
           AND distributor = '${testData.distributorId}'
           AND company = '${testData.company}'
       ) AS sub
       ORDER BY [TOWN],[LOCALITY],[SLOCALITY],[POP]`
    );
    const values = rows.map(r => r.POP_CODE);
    await use(values);
  },

  // Fetch Year
  year: async ({}, use) => {
    const value = await getSingleValue(
      `SELECT year 
       FROM jc_week 
       WHERE (
         SELECT TOP 1 working_date 
         FROM distributor 
         WHERE company = '${testData.company}' 
           AND distributor = '${testData.distributorId}'
       ) BETWEEN start_date AND end_date`,
      'year'
    );
    await use(value);
  },

  // Fetch Bank
  bank: async ({}, use) => {
    const value = await getSingleValue(
      `SELECT TOP 1 BANK AS bank
       FROM BANK B 
       WHERE B.COMPANY = '${testData.company}'
         AND EXISTS (
           SELECT 1
           FROM BRANCH BR 
           WHERE B.COMPANY = BR.COMPANY 
             AND B.BANK = BR.BANK
         )`,
      'bank'
    );
    await use(value);
  },

  // Fetch Territory
  territory: async ({}, use) => {
    const value = await getSingleValue(
      `DECLARE @Var VARCHAR(20);

       IF EXISTS (
         SELECT COMPCODE 
         FROM COMP_TABLE 
         WHERE company = '${testData.company}'
           AND COMPCODE = (
             SELECT TOP 1 Value_COMB 
             FROM Distributor_Association 
             WHERE Field_COMB = 'COMPCODE' 
               AND company = '${testData.company}' 
               AND Distributor = '${testData.distributorId}'
           )
       )
       BEGIN
         SET @Var = (
           SELECT COMPCODE 
           FROM COMP_TABLE 
           WHERE company = '${testData.company}'
             AND COMPCODE = (
               SELECT TOP 1 Value_COMB 
               FROM Distributor_Association 
               WHERE Field_COMB = 'COMPCODE' 
                 AND company = '${testData.company}' 
                 AND Distributor = '${testData.distributorId}' 
                 AND activeinactive = 'Y'
             )
         )
       END
       ELSE
       BEGIN
         SET @Var = (SELECT TOP 1 COMPCODE FROM COMP_TABLE WHERE ActiveInactive = 'Y')
       END

       SELECT @Var AS Territory`,
      'Territory'
    );
    await use(value);
  },

  // Fetch DSR for OB (currently query is executing in test cases to fetch Code)
  dsrOB: async ({}, use) => {
    const value = await getSingleValue(
      `DECLARE @CHECKDSR VARCHAR(10);

       SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));

       WHILE EXISTS (
         SELECT 1 FROM DSR 
         WHERE DSR = @CHECKDSR 
           AND distributor = '${testData.distributorId}'
       )
       BEGIN
         SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));
       END;

       SELECT @CHECKDSR AS DSR;`,
      'DSR'
    );
    await use(value);
  },

  // Fetch DSR for DM (currently query is executing in test cases to fetch Code)
  dsrDM: async ({}, use) => {
    const value = await getSingleValue(
      `DECLARE @CHECKDSR VARCHAR(10);

       SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));

       WHILE EXISTS (
         SELECT 1 FROM DSR 
         WHERE DSR = @CHECKDSR 
           AND distributor = '${testData.distributorId}'
       )
       BEGIN
         SET @CHECKDSR = CONVERT(VARCHAR(5), LEFT(NEWID(), 3));
       END;

       SELECT @CHECKDSR AS DSR;`,
      'DSR'
    );
    await use(value);
  },


  // Fetch SECTION
  section: async ({}, use) => {
    const value = await getSingleValue(
      `DECLARE @CHECKSEC VARCHAR(10);

       SETSEC: 
       SELECT @CHECKSEC = CONVERT(VARCHAR(5), LEFT(NEWID(), 4));

       IF EXISTS (
         SELECT SECTION 
         FROM SECTION 
         WHERE SECTION = @CHECKSEC 
           AND distributor = '${testData.distributorId}'
       ) 
       BEGIN  
         GOTO SETSEC  
       END 
       ELSE 
       BEGIN  
         SELECT @CHECKSEC AS SECTION  
       END;`,
      'SECTION'  
    );
    await use(value);
  },
  
  
    // Fetch PJP for OB
  PJPOB:  async ({}, use) => {
  const value = await getSingleValue(
    `DECLARE @CHECKPJP VARCHAR(10);

     SETPJP: 
     SELECT @CHECKPJP = CONVERT(VARCHAR(5), LEFT(NEWID(), 4));

     IF EXISTS (
       SELECT PJP 
       FROM PJP_HEAD 
       WHERE PJP = @CHECKPJP 
         AND distributor = '${testData.distributorId}'
     ) 
     BEGIN  
       GOTO SETPJP  
     END 
     ELSE 
     BEGIN  
       SELECT @CHECKPJP AS PJP  
     END;`,
    'PJP'  
  );
  await use(value);
},
  
  
  
    // Fetch PJP for DM
  PJPDM:  async ({}, use) => {
  const value = await getSingleValue(
    `DECLARE @CHECKPJP VARCHAR(10);

     SETPJP: 
     SELECT @CHECKPJP = CONVERT(VARCHAR(5), LEFT(NEWID(), 4));

     IF EXISTS (
       SELECT PJP 
       FROM PJP_HEAD 
       WHERE PJP = @CHECKPJP 
         AND distributor = '${testData.distributorId}'
     ) 
     BEGIN  
       GOTO SETPJP  
     END 
     ELSE 
     BEGIN  
       SELECT @CHECKPJP AS PJP  
     END;`,
    'PJP'  
  );
  await use(value);
},
  
  
});
