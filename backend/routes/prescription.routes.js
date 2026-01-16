const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all prescriptions
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        p.PRESCRIPTIONID,
        p.RECORDID,
        p.INSTRUCTION,
        r.VISITDATE,
        a.PATIENTIC,
        pt.FIRSTNAME || ' ' || pt.LASTNAME as PATIENT_NAME,
        a.DOCTORID,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        r.DIAGNOSIS
      FROM PRESCRIPTION p
      JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
      JOIN APPOINTMENTS a ON r.APPOINTMENTID = a.APPOINTMENTID
      JOIN PATIENTS pt ON a.PATIENTIC = pt.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      ORDER BY r.VISITDATE DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescriptions',
      error: err.message
    });
  }
});

// Get single prescription with items
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Fetching prescription with ID:', id);
    
    const prescriptionResult = await exec(
      `SELECT 
        p.PRESCRIPTIONID,
        p.RECORDID,
        p.INSTRUCTION,
        r.VISITDATE,
        a.PATIENTIC,
        pt.FIRSTNAME || ' ' || pt.LASTNAME as PATIENT_NAME,
        a.DOCTORID,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        r.DIAGNOSIS,
        r.SYMPTOM
      FROM PRESCRIPTION p
      JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
      JOIN APPOINTMENTS a ON r.APPOINTMENTID = a.APPOINTMENTID
      JOIN PATIENTS pt ON a.PATIENTIC = pt.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      WHERE p.PRESCRIPTIONID = :id`,
      { id }
    );

    console.log('Prescription result:', prescriptionResult.rows);

    if (prescriptionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    // Fetch prescription items (may be empty)
    const itemsResult = await exec(
      `SELECT 
        pi.PRESCRIPTIONITEMID,
        pi.PRESCRIPTIONID,
        pi.MEDICINEID,
        m.MEDNAME,
        m.MEDDOSAGEFORM,
        pi.QUANTITY,
        pi.DOSAGE,
        pi.DATEPRESCRIBED
      FROM PRESCRIPTIONITEM pi
      JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
      WHERE pi.PRESCRIPTIONID = :id`,
      { id }
    );

    console.log('Items result:', itemsResult.rows);

    res.json({
      success: true,
      data: {
        ...prescriptionResult.rows[0],
        items: itemsResult.rows || []
      }
    });
  } catch (err) {
    console.error('Error fetching prescription:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription',
      error: err.message
    });
  }
});

// Create prescription with items
router.post('/', async (req, res) => {
  const { recordId, instruction, items } = req.body;

  if (!recordId || !items || items.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: recordId, items (array with at least one item)'
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection();

    const prescriptionResult = await connection.execute(
      `INSERT INTO PRESCRIPTION (RECORDID, INSTRUCTION) 
       VALUES (:recordId, :instruction)
       RETURNING PRESCRIPTIONID INTO :id`,
      {
        recordId,
        instruction: instruction || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      },
      { autoCommit: false }
    );

    const prescriptionId = prescriptionResult.outBinds.id[0];

    for (const item of items) {
      await connection.execute(
        `INSERT INTO PRESCRIPTIONITEM 
          (PRESCRIPTIONID, MEDICINEID, QUANTITY, DOSAGE, DATEPRESCRIBED) 
         VALUES 
          (:prescriptionId, :medicineId, :quantity, :dosage, SYSDATE)`,
        {
          prescriptionId,
          medicineId: item.medicineId,
          quantity: item.quantity,
          dosage: item.dosage
        },
        { autoCommit: false }
      );

      await connection.execute(
        `UPDATE MEDICINE 
         SET CURRENTSTOCK = CURRENTSTOCK - :quantity 
         WHERE MEDICINEID = :medicineId`,
        {
          quantity: item.quantity,
          medicineId: item.medicineId
        },
        { autoCommit: false }
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully',
      prescriptionId: prescriptionId
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error creating prescription:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create prescription',
      error: err.message
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

// Delete prescription
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  let connection;
  try {
    connection = await oracledb.getConnection();

    await connection.execute(
      `DELETE FROM PRESCRIPTIONITEM WHERE PRESCRIPTIONID = :id`,
      { id },
      { autoCommit: false }
    );

    const result = await connection.execute(
      `DELETE FROM PRESCRIPTION WHERE PRESCRIPTIONID = :id`,
      { id },
      { autoCommit: false }
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Prescription not found'
      });
    }

    res.json({
      success: true,
      message: 'Prescription deleted successfully'
    });
  } catch (err) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Error deleting prescription:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete prescription',
      error: err.message
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;
