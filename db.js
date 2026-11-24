const sql = require('mssql/msnodesqlv8');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  driver: 'ODBC Driver 18 for SQL Server',
  options: {
    trustedConnection: true,
    trustServerCertificate: true
  }
};

module.exports = { sql, config };