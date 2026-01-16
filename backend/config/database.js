const oracledb = require('oracledb');

// Database Configuration
const dbConfig = {
  user: process.env.DB_USER || 'Novacare',
  password: process.env.DB_PASSWORD || 'oracle',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/freepdb1',
  poolMin: 4,
  poolMax: 10,
  poolIncrement: 2,
  poolTimeout: 60
};

// Initialize Oracle DB Connection Pool
async function initializeDB() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✓ Oracle DB connection pool created successfully');
  } catch (err) {
    console.error('✗ Error creating Oracle DB connection pool:', err);
    process.exit(1);
  }
}

// Database query helper function
async function exec(sql, binds = {}, opts = {}) {
  let conn;
  opts.outFormat = oracledb.OUT_FORMAT_OBJECT;
  opts.autoCommit = opts.autoCommit !== false; // Auto-commit by default
  
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

module.exports = {
  initializeDB,
  exec,
  oracledb
};
