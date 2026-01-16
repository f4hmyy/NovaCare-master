const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        MEDICINEID as MEDICINE_ID,
        MEDNAME as NAME,
        MEDPOSTINGDATE as POSTING_DATE,
        MEDEXPIRYDATE as EXPIRY_DATE,
        MEDDOSAGEFORM as DOSAGE_FORM,
        MEDDESCRIPTION as DESCRIPTION,
        MEDPRICE as PRICE,
        CURRENTSTOCK as CURRENT_STOCK,
        MANUFACTURER,
        SIDEEFFECTS as SIDE_EFFECTS
      FROM MEDICINE
      ORDER BY MEDICINEID DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching medicines:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicines',
      error: err.message
    });
  }
});

// Add new medicine
router.post('/', async (req, res) => {
  const {
    name,
    postingDate,
    expiryDate,
    dosageForm,
    description,
    price,
    currentStock,
    manufacturer,
    sideEffects
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Medicine name is required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO MEDICINE
        (MEDNAME, MEDPOSTINGDATE, MEDEXPIRYDATE, MEDDOSAGEFORM, MEDDESCRIPTION, MEDPRICE, CURRENTSTOCK, MANUFACTURER, SIDEEFFECTS)
       VALUES
        (:name, TO_DATE(:postingDate, 'YYYY-MM-DD'), TO_DATE(:expiryDate, 'YYYY-MM-DD'), :dosageForm, :description, :price, :currentStock, :manufacturer, :sideEffects)
       RETURNING MEDICINEID INTO :id`,
      {
        name,
        postingDate: postingDate || null,
        expiryDate: expiryDate || null,
        dosageForm: dosageForm || null,
        description: description || null,
        price: price || null,
        currentStock: currentStock || null,
        manufacturer: manufacturer || null,
        sideEffects: sideEffects || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Medicine added successfully',
      medicineId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding medicine:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add medicine',
      error: err.message
    });
  }
});

// Get single medicine
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        MEDICINEID as MEDICINE_ID,
        MEDNAME as NAME,
        MEDPOSTINGDATE as POSTING_DATE,
        MEDEXPIRYDATE as EXPIRY_DATE,
        MEDDOSAGEFORM as DOSAGE_FORM,
        MEDDESCRIPTION as DESCRIPTION,
        MEDPRICE as PRICE,
        CURRENTSTOCK as CURRENT_STOCK,
        MANUFACTURER,
        SIDEEFFECTS as SIDE_EFFECTS
       FROM MEDICINE
       WHERE MEDICINEID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching medicine:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch medicine',
      error: err.message
    });
  }
});

// Update medicine
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name,
    postingDate,
    expiryDate,
    dosageForm,
    description,
    price,
    currentStock,
    manufacturer,
    sideEffects
  } = req.body;

  try {
    await exec(
      `UPDATE MEDICINE
       SET MEDNAME = :name,
           MEDPOSTINGDATE = TO_DATE(:postingDate, 'YYYY-MM-DD'),
           MEDEXPIRYDATE = TO_DATE(:expiryDate, 'YYYY-MM-DD'),
           MEDDOSAGEFORM = :dosageForm,
           MEDDESCRIPTION = :description,
           MEDPRICE = :price,
           CURRENTSTOCK = :currentStock,
           MANUFACTURER = :manufacturer,
           SIDEEFFECTS = :sideEffects
       WHERE MEDICINEID = :id`,
      {
        id,
        name,
        postingDate,
        expiryDate,
        dosageForm,
        description,
        price,
        currentStock,
        manufacturer,
        sideEffects
      }
    );

    res.json({
      success: true,
      message: 'Medicine updated successfully'
    });
  } catch (err) {
    console.error('Error updating medicine:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update medicine',
      error: err.message
    });
  }
});

// Delete medicine
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM MEDICINE WHERE MEDICINEID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting medicine:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete medicine',
      error: err.message
    });
  }
});

module.exports = router;
