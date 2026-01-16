const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all specializations
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        SPECIALIZATIONID as ID, 
        SPECIALIZATIONTYPE as NAME,
        SPEC_DESC as DESCRIPTION
      FROM SPECIALIZATION 
      ORDER BY SPECIALIZATIONTYPE
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching specializations:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations',
      error: err.message
    });
  }
});

// Add new specialization
router.post('/', async (req, res) => {
  const { name, description } = req.body;

  // Validation
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Specialization name is required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO SPECIALIZATION 
        (SPECIALIZATIONTYPE, SPEC_DESC) 
       VALUES 
        (:name, :description)
       RETURNING SPECIALIZATIONID INTO :id`,
      {
        name: name,
        description: description || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Specialization added successfully',
      data: { id: result.outBinds.id[0], name, description }
    });
  } catch (err) {
    console.error('Error adding specialization:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add specialization',
      error: err.message
    });
  }
});

// Delete specialization
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await exec(
      `DELETE FROM SPECIALIZATION WHERE SPECIALIZATIONID = :id`,
      { id }
    );

    res.json({
      success: true,
      message: 'Specialization deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting specialization:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete specialization',
      error: err.message
    });
  }
});

module.exports = router;
