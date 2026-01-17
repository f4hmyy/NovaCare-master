const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        i.INVOICEID,
        i.APPOINTMENTID,
        i.TOTALAMOUNT,
        i.PAYMENTMETHOD,
        i.DATEPAID,
        (SELECT APPOINTMENTDATE FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID) as APPOINTMENTDATE,
        (SELECT PATIENTIC FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID) as PATIENT_IC,
        (SELECT FIRSTNAME || ' ' || LASTNAME FROM PATIENTS 
         WHERE PATIENTIC = (SELECT PATIENTIC FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID)) as PATIENT_NAME,
        (SELECT FIRSTNAME || ' ' || LASTNAME FROM DOCTORS 
         WHERE DOCTORID = (SELECT DOCTORID FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID)) as DOCTOR_NAME,
        CASE WHEN i.DATEPAID IS NOT NULL THEN 'Paid' ELSE 'Pending' END as PAYMENT_STATUS
      FROM INVOICE i
      ORDER BY i.INVOICEID DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching invoices:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: err.message
    });
  }
});

// Get single invoice by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await exec(`
      SELECT 
        i.INVOICEID,
        i.APPOINTMENTID,
        i.TOTALAMOUNT,
        i.PAYMENTMETHOD,
        i.DATEPAID,
        (SELECT APPOINTMENTDATE FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID) as APPOINTMENTDATE,
        (SELECT PATIENTIC FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID) as PATIENT_IC,
        (SELECT FIRSTNAME || ' ' || LASTNAME FROM PATIENTS 
         WHERE PATIENTIC = (SELECT PATIENTIC FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID)) as PATIENT_NAME,
        (SELECT FIRSTNAME || ' ' || LASTNAME FROM DOCTORS 
         WHERE DOCTORID = (SELECT DOCTORID FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID)) as DOCTOR_NAME,
        (SELECT REASONTOVISIT FROM APPOINTMENTS WHERE APPOINTMENTID = i.APPOINTMENTID) as REASON_TO_VISIT,
        CASE WHEN i.DATEPAID IS NOT NULL THEN 'Paid' ELSE 'Pending' END as PAYMENT_STATUS
      FROM INVOICE i
      WHERE i.INVOICEID = :id
    `, { id });
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: err.message
    });
  }
});

// Create new invoice
router.post('/', async (req, res) => {
  const { appointmentid, totalamount, paymentmethod, datepaid } = req.body;

  if (!appointmentid) {
    return res.status(400).json({
      success: false,
      message: 'Appointment ID is required'
    });
  }

  try {
    // Calculate prescription medicine cost for this appointment
    const prescriptionCostResult = await exec(`
      SELECT NVL(SUM(pi.QUANTITY * m.MEDPRICE), 0) as MEDICINE_COST
      FROM PRESCRIPTION p
      JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
      JOIN PRESCRIPTIONITEM pi ON p.PRESCRIPTIONID = pi.PRESCRIPTIONID
      JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
      WHERE r.APPOINTMENTID = :appointmentid
    `, { appointmentid: parseInt(appointmentid) });

    const medicineCost = prescriptionCostResult.rows[0]?.MEDICINE_COST || 0;
    
    // If totalamount is provided, add medicine cost to it
    const finalAmount = totalamount 
      ? parseFloat(totalamount) + medicineCost 
      : medicineCost;
       
    console.log(`Invoice for appointment ${appointmentid}: Base amount: ${totalamount || 0}, Medicine cost: ${medicineCost}, Final amount: ${finalAmount}`);

    const result = await exec(`
      INSERT INTO INVOICE (APPOINTMENTID, TOTALAMOUNT, PAYMENTMETHOD, DATEPAID)
      VALUES (:appointmentid, :totalamount, :paymentmethod, ${datepaid ? 'TO_DATE(:datepaid, \'YYYY-MM-DD\')' : 'NULL'})
      RETURNING INVOICEID INTO :invoiceid
    `, {
      appointmentid: parseInt(appointmentid),
      totalamount: finalAmount,
      paymentmethod: paymentmethod || null,
      ...(datepaid && { datepaid }),
      invoiceid: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: { 
        invoiceId: result.outBinds.invoiceid[0],
        medicineCost: medicineCost,
        totalAmount: finalAmount
      }
    });
  } catch (err) {
    console.error('Error creating invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: err.message
    });
  }
});

// Update invoice (mark as paid)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { totalamount, paymentmethod, datepaid } = req.body;

  try {
    const result = await exec(`
      UPDATE INVOICE
      SET TOTALAMOUNT = :totalamount,
          PAYMENTMETHOD = :paymentmethod,
          DATEPAID = ${datepaid ? 'TO_DATE(:datepaid, \'YYYY-MM-DD\')' : 'NULL'}
      WHERE INVOICEID = :id
    `, {
      totalamount: parseFloat(totalamount),
      paymentmethod: paymentmethod || null,
      ...(datepaid && { datepaid }),
      id
    });

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice updated successfully'
    });
  } catch (err) {
    console.error('Error updating invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice',
      error: err.message
    });
  }
});

// Delete invoice
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM INVOICE WHERE INVOICEID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting invoice:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete invoice',
      error: err.message
    });
  }
});

// Get prescription medicine cost for an appointment
router.get('/appointment/:id/prescription-cost', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(`
      SELECT 
        NVL(SUM(pi.QUANTITY * m.MEDPRICE), 0) as MEDICINE_COST,
        COUNT(DISTINCT p.PRESCRIPTIONID) as PRESCRIPTION_COUNT,
        COUNT(pi.PRESCRIPTIONITEMID) as MEDICINE_COUNT
      FROM PRESCRIPTION p
      JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
      LEFT JOIN PRESCRIPTIONITEM pi ON p.PRESCRIPTIONID = pi.PRESCRIPTIONID
      LEFT JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
      WHERE r.APPOINTMENTID = :id
    `, { id });

    res.json({
      success: true,
      data: {
        medicineCost: result.rows[0]?.MEDICINE_COST || 0,
        prescriptionCount: result.rows[0]?.PRESCRIPTION_COUNT || 0,
        medicineCount: result.rows[0]?.MEDICINE_COUNT || 0
      }
    });
  } catch (err) {
    console.error('Error fetching prescription cost:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prescription cost',
      error: err.message
    });
  }
});

module.exports = router;
