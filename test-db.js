const mariadb = require('mariadb');

async function testConnection() {
  const pool = mariadb.createPool({
    host: '195.88.211.20',
    port: 3306,
    user: 'jazacade_abukafa',
    password: 'Administrator*2025',
    database: 'jazacade_shopme',
    connectionLimit: 5
  });

  try {
    const conn = await pool.getConnection();
    console.log("Connected successfully");
    const rows = await conn.query("SELECT 1 as val");
    console.log(rows);
    conn.release();
  } catch (err) {
    console.error("Connection failed", err);
  } finally {
    await pool.end();
  }
}

testConnection();
