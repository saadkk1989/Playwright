import sql from "mssql";

const config: sql.config = {
  user: "sqa_user",
  password: "sqa@123",
  server: "128.1.103.4",   // only the IP
  port: 50376,             // your SQL instance port
  database: "HICO_NDB_2",
  options: {
    encrypt: false, // set true if using Azure
    trustServerCertificate: true
  }
};

export async function runQuery(query: string) {
  const pool = await sql.connect(config);
  const result = await pool.request().query(query);
  return result.recordset;
}

// fetch single value
export async function getSingleValue(query: string, column: string) {
  const rows = await runQuery(query);
  if (rows.length > 0) {
    return rows[0][column];
  }
  return null;
}

// fetch all values from a column
export async function getAllValues(query: string, column: string) {
  const rows = await runQuery(query);
  return rows.map(row => row[column]); // returns an array of values
}

// fetch all rows (array of objects with all fields)
export async function getAllRows(query: string) {
  const rows = await runQuery(query);
  return rows; // returns array of row objects
}
