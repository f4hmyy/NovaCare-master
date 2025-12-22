const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------- MIDDLEWARE -----------------
// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ----------------- DB CONFIG -----------------
const dbConfig = {
  user: process.env.DB_USER || 'Novacare',
  password: process.env.DB_PASSWORD || 'oracle',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/freepdb1',
  poolMin: 4,
  poolMax: 10,
  poolIncrement: 2,
  poolTimeout: 60
};

// Initialize Oracle DB Connection Pool
async function initializeDB() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('✓ Oracle DB connection pool created successfully');
  } catch (err) {
    console.error('✗ Error creating Oracle DB connection pool:', err);
    process.exit(1);
  }
}

// Database query helper function
async function exec(sql, binds = {}, opts = {}) {
  let conn;
  opts.outFormat = oracledb.OUT_FORMAT_OBJECT;
  opts.autoCommit = opts.autoCommit !== false; // Auto-commit by default
  
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, opts);
    return result;
  } catch (err) {
    console.error('Database query error:', err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
}

// ----------------- TEST ROUTES -----------------
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is running!',
    timestamp: new Date().toISOString()
  });
});

// Test DB connection
app.get('/api/test/db', async (req, res) => {
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

// ----------------- SPECIALIZATIONS ROUTES -----------------
// Get all specializations
app.get('/api/specializations', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        SPECIALIZATIONID as ID, 
        SPECIALIZATIONTYPE as NAME
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
app.post('/api/specializations', async (req, res) => {
  const { name } = req.body;

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
        (SPECIALIZATIONTYPE) 
       VALUES 
        (:name)
       RETURNING SPECIALIZATIONID INTO :id`,
      {
        name: name,
        id: { dir: require('oracledb').BIND_OUT, type: require('oracledb').NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Specialization added successfully',
      data: { id: result.outBinds.id[0], name }
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
app.delete('/api/specializations/:id', async (req, res) => {
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

// ----------------- DOCTORS ROUTES -----------------
// Get all doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        DOCTORID as DOCTOR_ID, 
        FIRSTNAME as FIRST_NAME, 
        LASTNAME as LAST_NAME, 
        SPECIALIZATIONID as SPECIALIZATION, 
        EMAIL, 
        PHONENUM as PHONE, 
        LICENSENUM as LICENSE_NUMBER,
        STATUS
      FROM DOCTORS 
      ORDER BY DOCTORID DESC
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
app.post('/api/doctors', async (req, res) => {
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
app.get('/api/doctors/:id', async (req, res) => {
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
app.put('/api/doctors/:id', async (req, res) => {
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
app.delete('/api/doctors/:id', async (req, res) => {
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

// ----------------- PATIENTS ROUTES -----------------
// Get all patients
app.get('/api/patients', async (req, res) => {
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
app.post('/api/patients', async (req, res) => {
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
app.get('/api/patients/:ic', async (req, res) => {
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
app.put('/api/patients/:ic', async (req, res) => {
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
app.delete('/api/patients/:ic', async (req, res) => {
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

// ----------------- APPOINTMENTS ROUTES -----------------
// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        a.APPOINTMENTID as APPOINTMENT_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.STATUS,
        a.REASON,
        a.NOTES,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        p.PHONENUM as PATIENT_PHONE
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
app.get('/api/appointments/date/:date', async (req, res) => {
  const { date } = req.params;

  try {
    const result = await exec(
      `SELECT 
        a.APPOINTMENTID as APPOINTMENT_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.STATUS,
        a.REASON,
        a.NOTES,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        p.PHONENUM as PATIENT_PHONE
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
app.post('/api/appointments', async (req, res) => {
  const { 
    patientIC, 
    doctorId, 
    appointmentDate, 
    appointmentTime, 
    reason,
    notes
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
       AND TRUNC(APPOINTMENTDATE) = TO_DATE(:date, 'YYYY-MM-DD')
       AND APPOINTMENTTIME = :time
       AND STATUS != 'Cancelled'`,
      { doctorId, date: appointmentDate, time: appointmentTime }
    );

    if (conflict.rows[0].CNT > 0) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked for this doctor'
      });
    }

    const result = await exec(
      `INSERT INTO APPOINTMENTS 
        (PATIENTIC, DOCTORID, APPOINTMENTDATE, APPOINTMENTTIME, STATUS, REASON, NOTES) 
       VALUES 
        (:patientIC, :doctorId, TO_DATE(:date, 'YYYY-MM-DD'), :time, 'Scheduled', :reason, :notes)
       RETURNING APPOINTMENTID INTO :id`,
      {
        patientIC,
        doctorId,
        date: appointmentDate,
        time: appointmentTime,
        reason: reason || null,
        notes: notes || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      appointmentId: result.outBinds.id[0]
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
app.get('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT 
        a.APPOINTMENTID as APPOINTMENT_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.STATUS,
        a.REASON,
        a.NOTES,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        p.PHONENUM as PATIENT_PHONE,
        p.EMAIL as PATIENT_EMAIL
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
app.patch('/api/appointments/:id/status', async (req, res) => {
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
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    patientIC, 
    doctorId, 
    appointmentDate, 
    appointmentTime, 
    status,
    reason,
    notes
  } = req.body;

  try {
    await exec(
      `UPDATE APPOINTMENTS 
       SET PATIENTIC = :patientIC,
           DOCTORID = :doctorId,
           APPOINTMENTDATE = TO_DATE(:date, 'YYYY-MM-DD'),
           APPOINTMENTTIME = :time,
           STATUS = :status,
           REASON = :reason,
           NOTES = :notes
       WHERE APPOINTMENTID = :id`,
      {
        id,
        patientIC,
        doctorId,
        date: appointmentDate,
        time: appointmentTime,
        status,
        reason,
        notes
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
app.delete('/api/appointments/:id', async (req, res) => {
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

// ----------------- MEDICINE ROUTES -----------------
// Get all medicines
app.get('/api/medicine', async (req, res) => {
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
app.post('/api/medicine', async (req, res) => {
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
app.get('/api/medicine/:id', async (req, res) => {
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
app.put('/api/medicine/:id', async (req, res) => {
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
app.delete('/api/medicine/:id', async (req, res) => {
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

// ----------------- ERROR HANDLING MIDDLEWARE -----------------
// 404 Handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found' 
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ----------------- SERVER STARTUP -----------------
async function startServer() {
  try {
    await initializeDB();
    
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API endpoint: http://localhost:${PORT}/api/test`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server gracefully...');
  try {
    await oracledb.getPool().close(10);
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing server gracefully...');
  try {
    await oracledb.getPool().close(10);
    console.log('Database pool closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
});

// Start the server
startServer();

// Export for testing
module.exports = { app, exec };