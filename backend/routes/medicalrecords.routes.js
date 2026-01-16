const express = require('express');
const router = express.Router();
const { exec } = require('../config/database');

// Get all medical records
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        r.RECORDID,
        r.VISITDATE,
        a.PATIENTIC,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        a.DOCTORID,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        r.SYMPTOM,
        r.DIAGNOSIS,
        r.APPOINTMENTID
      FROM MEDICALRECORD r
      JOIN APPOINTMENTS a ON r.APPOINTMENTID = a.APPOINTMENTID
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      ORDER BY r.VISITDATE DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical records',
      error: err.message
    });
  }
});

// Get single medical record by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await exec(`
      SELECT 
        r.RECORDID,
        r.VISITDATE,
        a.PATIENTIC,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        a.DOCTORID,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        r.SYMPTOM,
        r.DIAGNOSIS,
        r.APPOINTMENTID
      FROM MEDICALRECORD r
      JOIN APPOINTMENTS a ON r.APPOINTMENTID = a.APPOINTMENTID
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      WHERE r.RECORDID = :id
    `, { id });
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching medical record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medical record',
      error: err.message
    });
  }
});

// Create new medical record
router.post('/', async (req, res) => {
  const { appointmentid, visitdate, symptom, diagnosis } = req.body;

  if (!appointmentid || !visitdate) {
    return res.status(400).json({
      success: false,
      message: 'Appointment ID and Visit Date are required'
    });
  }

  try {
    // Get next RECORDID
    const idResult = await exec(`SELECT NVL(MAX(RECORDID), 0) + 1 as NEXT_ID FROM MEDICALRECORD`);
    const nextId = idResult.rows[0].NEXT_ID;

    const result = await exec(`
      INSERT INTO MEDICALRECORD (RECORDID, APPOINTMENTID, VISITDATE, SYMPTOM, DIAGNOSIS)
      VALUES (:recordid, :appointmentid, TO_DATE(:visitdate, 'YYYY-MM-DD'), :symptom, :diagnosis)
    `, {
      recordid: nextId,
      appointmentid: parseInt(appointmentid),
      visitdate,
      symptom: symptom || null,
      diagnosis: diagnosis || null
    });

    res.status(201).json({
      success: true,
      message: 'Medical record created successfully',
      data: { recordId: nextId }
    });
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create medical record',
      error: err.message
    });
  }
});

// Update medical record
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { appointmentid, visitdate, symptom, diagnosis } = req.body;

  if (!appointmentid || !visitdate) {
    return res.status(400).json({
      success: false,
      message: 'Appointment ID and Visit Date are required'
    });
  }

  try {
    const result = await exec(`
      UPDATE MEDICALRECORD
      SET APPOINTMENTID = :appointmentid,
          VISITDATE = TO_DATE(:visitdate, 'YYYY-MM-DD'),
          SYMPTOM = :symptom,
          DIAGNOSIS = :diagnosis
      WHERE RECORDID = :id
    `, {
      appointmentid: parseInt(appointmentid),
      visitdate,
      symptom: symptom || null,
      diagnosis: diagnosis || null,
      id
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical record updated successfully'
    });
  } catch (err) {
    console.error('Error updating medical record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical record',
      error: err.message
    });
  }
});

// Delete medical record
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(`
      DELETE FROM MEDICALRECORD WHERE RECORDID = :id
    `, { id });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting medical record:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medical record',
      error: err.message
    });
  }
});

module.exports = router;
