const oracledb = require('oracledb');
require('dotenv').config();

let pool;

async function connectDB() {
  try {
    pool = await oracledb.createPool({
      user:          process.env.DB_USER,
      password:      process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin:       2,
      poolMax:       10,
      poolIncrement: 1,
    });

    // Warmup connection
    const conn = await pool.getConnection();
    await conn.execute('SELECT 1 FROM DUAL');
    await conn.close();

    console.log('Oracle DB connected successfully');
  } catch (err) {
    console.error('DB Connection Failed:', err);
    process.exit(1);
  }
}

async function getConnection() {
  return await pool.getConnection();
}

module.exports = { connectDB, getConnection };