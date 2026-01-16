const express = require('express');
const router = express.Router();
const { exec } = require('../config/database');

// Get all patients
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        PATIENTIC as PATIENT_IC,
        FIRSTNAME as FIRST_NAME, 
        LASTNAME as LAST_NAME, 
        DATEOFBIRTH as DATE_OF_BIRTH,
        GENDER,
        PHONENUM as PHONE, 
        EMAIL,
        ADDRESS,
        EMERGENCYCONTACT as EMERGENCY_CONTACT,
        BLOODTYPE as BLOOD_TYPE,
        ALLERGIES
      FROM PATIENTS 
      ORDER BY PATIENTIC DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching patients:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patients',
      error: err.message
    });
  }
});

// Add new patient
router.post('/', async (req, res) => {
  console.log('=== POST /api/patients called ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const { 
    patientIC,
    firstName, 
    lastName, 
    dateOfBirth, 
    gender, 
    phone, 
    email, 
    address, 
    emergencyContact,
    bloodType,
    allergies
  } = req.body;

  // Validation
  if (!patientIC || !firstName || !lastName || !dateOfBirth || !gender || !phone) {
    console.log('Validation failed:', { patientIC, firstName, lastName, dateOfBirth, gender, phone });
    return res.status(400).json({
      success: false,
      message: 'Required fields: patientIC, firstName, lastName, dateOfBirth, gender, phone'
    });
  }

  console.log('Validation passed, attempting database insert...');

  try {
    await exec(
      `INSERT INTO PATIENTS 
        (PATIENTIC, FIRSTNAME, LASTNAME, DATEOFBIRTH, GENDER, PHONENUM, EMAIL, ADDRESS, EMERGENCYCONTACT, BLOODTYPE, ALLERGIES) 
       VALUES 
        (:patientIC, :firstName, :lastName, TO_DATE(:dob, 'YYYY-MM-DD'), :gender, :phone, :email, :address, :emergencyContact, :bloodType, :allergies)`,
      {
        patientIC,
        firstName,
        lastName,
        dob: dateOfBirth,
        gender,
        phone,
        email: email || null,
        address: address || null,
        emergencyContact: emergencyContact || null,
        bloodType: bloodType || null,
        allergies: allergies || null
      }
    );

    console.log('Patient inserted successfully!');
    res.status(201).json({
      success: true,
      message: 'Patient added successfully',
      patientIC: patientIC
    });
  } catch (err) {
    console.error('=== DATABASE ERROR ===');
    console.error('Error adding patient:', err);
    console.error('Error message:', err.message);
    console.error('Error code:', err.errorNum);
    console.error('======================');
    res.status(500).json({
      success: false,
      message: 'Failed to add patient',
      error: err.message
    });
  }
});

// Get single patient
router.get('/:ic', async (req, res) => {
  const { ic } = req.params;

  try {
    const result = await exec(
      `SELECT 
        PATIENTIC as PATIENT_IC,
        FIRSTNAME as FIRST_NAME, 
        LASTNAME as LAST_NAME, 
        DATEOFBIRTH as DATE_OF_BIRTH,
        GENDER,
        PHONENUM as PHONE, 
        EMAIL,
        ADDRESS,
        EMERGENCYCONTACT as EMERGENCY_CONTACT,
        BLOODTYPE as BLOOD_TYPE,
        ALLERGIES
       FROM PATIENTS 
       WHERE PATIENTIC = :ic`,
      { ic }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching patient:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch patient',
      error: err.message
    });
  }
});

// Update patient
router.put('/:ic', async (req, res) => {
  const { ic } = req.params;
  const { 
    firstName, 
    lastName, 
    dateOfBirth, 
    gender, 
    phone, 
    email, 
    address, 
    emergencyContact,
    bloodType,
    allergies
  } = req.body;

  try {
    await exec(
      `UPDATE PATIENTS 
       SET FIRSTNAME = :firstName,
           LASTNAME = :lastName,
           DATEOFBIRTH = TO_DATE(:dob, 'YYYY-MM-DD'),
           GENDER = :gender,
           PHONENUM = :phone,
           EMAIL = :email,
           ADDRESS = :address,
           EMERGENCYCONTACT = :emergencyContact,
           BLOODTYPE = :bloodType,
           ALLERGIES = :allergies
       WHERE PATIENTIC = :ic`,
      {
        ic,
        firstName,
        lastName,
        dob: dateOfBirth,
        gender,
        phone,
        email,
        address,
        emergencyContact,
        bloodType,
        allergies
      }
    );

    res.json({
      success: true,
      message: 'Patient updated successfully'
    });
  } catch (err) {
    console.error('Error updating patient:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient',
      error: err.message
    });
  }
});

// Delete patient
router.delete('/:ic', async (req, res) => {
  const { ic } = req.params;

  try {
    const result = await exec(
      `DELETE FROM PATIENTS WHERE PATIENTIC = :ic`,
      { ic }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting patient:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: err.message
    });
  }
});

module.exports = router;
