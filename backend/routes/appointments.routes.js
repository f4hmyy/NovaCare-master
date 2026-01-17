const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        a.APPOINTMENTID as APPOINTMENT_ID,
        a.STAFFID as STAFF_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.ROOMID as ROOM_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.REASONTOVISIT as REASON_TO_VISIT,
        a.STATUS,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        p.PHONENUM as PATIENT_PHONE,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        
        (SELECT s.FIRSTNAME || ' ' || s.LASTNAME 
         FROM STAFF s 
         WHERE s.STAFFID = a.STAFFID) as STAFF_NAME,
         
        (SELECT r.ROOMTYPE 
         FROM ROOMS r 
         WHERE r.ROOMID = a.ROOMID) as ROOM_TYPE
      FROM APPOINTMENTS a
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      ORDER BY a.APPOINTMENTDATE DESC, a.APPOINTMENTTIME DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: err.message
    });
  }
});

// Get appointments by date
router.get('/date/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const result = await exec(
      `SELECT 
        a.APPOINTMENTID as APPOINTMENT_ID,
        a.STAFFID as STAFF_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.ROOMID as ROOM_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.REASONTOVISIT as REASON_TO_VISIT,
        a.STATUS,
        
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        p.PHONENUM as PATIENT_PHONE,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,

        (SELECT s.FIRSTNAME || ' ' || s.LASTNAME 
         FROM STAFF s 
         WHERE s.STAFFID = a.STAFFID) as STAFF_NAME,

        (SELECT r.ROOMTYPE 
         FROM ROOMS r 
         WHERE r.ROOMID = a.ROOMID) as ROOM_TYPE

      FROM APPOINTMENTS a
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID

      WHERE TRUNC(a.APPOINTMENTDATE) = TO_DATE(:date, 'YYYY-MM-DD')
      ORDER BY a.APPOINTMENTTIME`,
      { date }
    );
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching appointments by date:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: err.message
    });
  }
});

// Add new appointment
router.post('/', async (req, res) => {
  const { 
    staffId,
    patientIC, 
    doctorId, 
    roomId,
    appointmentDate, 
    appointmentTime, 
    reasonToVisit
  } = req.body;

  // Validation
  if (!patientIC || !doctorId || !appointmentDate || !appointmentTime) {
    return res.status(400).json({
      success: false,
      message: 'Required fields: patientIC, doctorId, appointmentDate, appointmentTime'
    });
  }

  try {
    // Check for conflicting appointments
    const conflict = await exec(
      `SELECT COUNT(*) as CNT 
       FROM APPOINTMENTS 
       WHERE DOCTORID = :doctorId 
       AND TRUNC(APPOINTMENTDATE) = TO_DATE(:appointmentDate, 'YYYY-MM-DD')
       AND APPOINTMENTTIME = :appointmentTime
       AND STATUS != 'Cancelled'`,
      { doctorId, appointmentDate, appointmentTime }
    );

    if (conflict.rows[0].CNT > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor'
      });
    }

    const result = await exec(
      `INSERT INTO APPOINTMENTS 
        (STAFFID, PATIENTIC, DOCTORID, ROOMID, APPOINTMENTDATE, APPOINTMENTTIME, REASONTOVISIT, STATUS) 
       VALUES 
        (:staffId, :patientIC, :doctorId, :roomId, TO_DATE(:appointmentDate, 'YYYY-MM-DD'), :appointmentTime, :reasonToVisit, 'Scheduled')
       RETURNING APPOINTMENTID INTO :appointmentId`,
      {
        staffId: staffId || null,
        patientIC,
        doctorId,
        roomId: roomId || null,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        reasonToVisit: reasonToVisit || null,
        appointmentId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: result.outBinds.appointmentId[0]
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: err.message
    });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT 
        a.APPOINTMENTID as APPOINTMENT_ID,
        a.STAFFID as STAFF_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.ROOMID as ROOM_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.REASONTOVISIT as REASON_TO_VISIT,
        a.STATUS,
        
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        p.PHONENUM as PATIENT_PHONE,
        p.EMAIL as PATIENT_EMAIL,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,

        (SELECT s.FIRSTNAME || ' ' || s.LASTNAME 
         FROM STAFF s 
         WHERE s.STAFFID = a.STAFFID) as STAFF_NAME,
        (SELECT r.ROOMTYPE 
         FROM ROOMS r 
         WHERE r.ROOMID = a.ROOMID) as ROOM_TYPE
      FROM APPOINTMENTS a
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID

      WHERE a.APPOINTMENTID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching appointment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: err.message
    });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Status is required'
    });
  }

  try {
    await exec(
      `UPDATE APPOINTMENTS 
       SET STATUS = :status
       WHERE APPOINTMENTID = :id`,
      { id, status }
    );

    res.json({
      success: true,
      message: 'Appointment status updated successfully'
    });
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: err.message
    });
  }
});

// Update appointment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    staffId,
    patientIC, 
    doctorId, 
    roomId,
    appointmentDate, 
    appointmentTime, 
    status,
    reasonToVisit
  } = req.body;

  try {
    await exec(
      `UPDATE APPOINTMENTS 
       SET STAFFID = :staffId,
           PATIENTIC = :patientIC,
           DOCTORID = :doctorId,
           ROOMID = :roomId,
           APPOINTMENTDATE = TO_DATE(:date, 'YYYY-MM-DD'),
           APPOINTMENTTIME = :time,
           STATUS = :status,
           REASONTOVISIT = :reasonToVisit
       WHERE APPOINTMENTID = :id`,
      {
        id,
        staffId: staffId || null,
        patientIC,
        doctorId,
        roomId: roomId || null,
        date: appointmentDate,
        time: appointmentTime,
        status,
        reasonToVisit: reasonToVisit || null
      }
    );

    res.json({
      success: true,
      message: 'Appointment updated successfully'
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: err.message
    });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM APPOINTMENTS WHERE APPOINTMENTID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete appointment',
      error: err.message
    });
  }
});

module.exports = router;
