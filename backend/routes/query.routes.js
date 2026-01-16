const express = require('express');
const router = express.Router();
const { exec } = require('../config/database');

// Execute custom SQL query (for admin/development use)
router.post('/', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  // Basic security: prevent certain dangerous operations
  const dangerousKeywords = ['DROP DATABASE', 'DROP USER', 'CREATE USER', 'ALTER USER', 'GRANT', 'REVOKE'];
  const upperQuery = query.trim().toUpperCase();
  
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return res.status(403).json({
        success: false,
        message: `Query contains forbidden keyword: ${keyword}`
      });
    }
  }

  // Detect query type
  let queryType = 'UNKNOWN';
  if (upperQuery.startsWith('SELECT')) queryType = 'SELECT';
  else if (upperQuery.startsWith('INSERT')) queryType = 'INSERT';
  else if (upperQuery.startsWith('UPDATE')) queryType = 'UPDATE';
  else if (upperQuery.startsWith('DELETE')) queryType = 'DELETE';
  else if (upperQuery.startsWith('CREATE')) queryType = 'CREATE';
  else if (upperQuery.startsWith('ALTER')) queryType = 'ALTER';
  else if (upperQuery.startsWith('DROP')) queryType = 'DROP';

  try {
    const result = await exec(query);
    
    // Extract column names from the result metadata (for SELECT queries)
    const columns = result.metaData ? result.metaData.map(col => col.name) : [];
    
    // For non-SELECT queries, return rows affected
    const rowsAffected = result.rowsAffected || 0;
    
    res.json({
      success: true,
      queryType: queryType,
      columns: columns,
      rows: result.rows || [],
      rowCount: result.rows ? result.rows.length : 0,
      rowsAffected: queryType !== 'SELECT' ? rowsAffected : undefined,
      message: 'Query executed successfully'
    });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to execute query',
      error: err.message
    });
  }
});

module.exports = router;
