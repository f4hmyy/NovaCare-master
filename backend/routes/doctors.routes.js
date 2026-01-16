const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all doctors
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        d.DOCTORID as DOCTOR_ID, 
        d.FIRSTNAME as FIRST_NAME, 
        d.LASTNAME as LAST_NAME, 
        s.SPECIALIZATIONTYPE as SPECIALIZATION, 
        d.EMAIL, 
        d.PHONENUM as PHONE, 
        d.LICENSENUM as LICENSE_NUMBER,
        d.STATUS
      FROM DOCTORS d
      LEFT JOIN SPECIALIZATION s ON d.SPECIALIZATIONID = s.SPECIALIZATIONID
      ORDER BY d.DOCTORID DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: err.message
    });
  }
});

// Add new doctor
router.post('/', async (req, res) => {
  const { firstName, lastName, specialization, email, phone, licenseNumber } = req.body;

  // Validation
  if (!firstName || !lastName || !specialization || !email || !phone || !licenseNumber) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO DOCTORS 
        (FIRSTNAME, LASTNAME, SPECIALIZATIONID, EMAIL, PHONENUM, LICENSENUM, STATUS) 
       VALUES 
        (:firstName, :lastName, :specialization, :email, :phone, :licenseNum, 'Active')
       RETURNING DOCTORID INTO :id`,
      {
        firstName,
        lastName,
        specialization,
        email,
        phone,
        licenseNum: licenseNumber,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctorId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding doctor:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add doctor',
      error: err.message
    });
  }
});

// Get single doctor by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT 
        DOCTORID as DOCTOR_ID, 
        FIRSTNAME as FIRST_NAME, 
        LASTNAME as LAST_NAME, 
        SPECIALIZATIONID as SPECIALIZATION, 
        EMAIL, 
        PHONENUM as PHONE, 
        LICENSENUM as LICENSE_NUMBER,
        STATUS
       FROM DOCTORS 
       WHERE DOCTORID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching doctor:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor',
      error: err.message
    });
  }
});

// Update doctor
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, phone, licenseNumber } = req.body;

  try {
    const result = await exec(
      `UPDATE DOCTORS 
       SET 
        FIRSTNAME = :firstName,
        LASTNAME = :lastName,
        EMAIL = :email,
        PHONENUM = :phone,
        LICENSENUM = :licenseNum
       WHERE DOCTORID = :id`,
      { firstName, lastName, email, phone, licenseNum: licenseNumber, id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully'
    });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor',
      error: err.message
    });
  }
});

// Delete doctor
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      'DELETE FROM DOCTORS WHERE DOCTORID = :id',
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete doctor',
      error: err.message
    });
  }
});

module.exports = router;
