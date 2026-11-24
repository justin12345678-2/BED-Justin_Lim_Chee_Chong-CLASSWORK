console.log('Test file is running!');
const { sql, config } = require('./db');

async function testConnection() {
  try {
    const pool = await sql.connect(config);

    console.log('Connected to SQL Server successfully!');

    const result = await pool.request().query(
      'SELECT * FROM Categories'
    );

    console.log(result.recordset);

    await pool.close();
  } catch (error) {
    console.log('Connection failed:', error.message);
  }
}

testConnection();