const express = require('express');
const router = express.Router();

// Test routes
router.get('/test', (req, res) => {
  res.json({ 
    message: 'API is running!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
