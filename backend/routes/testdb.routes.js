const express = require('express');
const router = express.Router();
const { exec } = require('../config/database');

// Test DB connection
router.get('/db', async (req, res) => {
  try {
    const result = await exec('SELECT SYSDATE FROM DUAL');
    res.json({ 
      success: true,
      message: 'Database connection successful',
      serverTime: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Database connection failed',
      error: err.message 
    });
  }
});

module.exports = router;
