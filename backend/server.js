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
        a.STAFFID as STAFF_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.ROOMID as ROOM_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.REASONTOVISIT as REASON_TO_VISIT,
        a.STATUS,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        s.FIRSTNAME || ' ' || s.LASTNAME as STAFF_NAME,
        r.ROOMTYPE as ROOM_TYPE,
        p.PHONENUM as PATIENT_PHONE
      FROM APPOINTMENTS a
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      LEFT JOIN STAFF s ON a.STAFFID = s.STAFFID
      LEFT JOIN ROOMS r ON a.ROOMID = r.ROOMID
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
        a.STAFFID as STAFF_ID,
        a.PATIENTIC as PATIENT_IC,
        a.DOCTORID as DOCTOR_ID,
        a.ROOMID as ROOM_ID,
        a.APPOINTMENTDATE as APPOINTMENT_DATE,
        a.APPOINTMENTTIME as APPOINTMENT_TIME,
        a.REASONTOVISIT as REASON_TO_VISIT,
        a.STATUS,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        s.FIRSTNAME || ' ' || s.LASTNAME as STAFF_NAME,
        r.ROOMTYPE as ROOM_TYPE,
        p.PHONENUM as PATIENT_PHONE
      FROM APPOINTMENTS a
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      LEFT JOIN STAFF s ON a.STAFFID = s.STAFFID
      LEFT JOIN ROOMS r ON a.ROOMID = r.ROOMID
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
app.get('/api/appointments/:id', async (req, res) => {
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
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        s.FIRSTNAME || ' ' || s.LASTNAME as STAFF_NAME,
        r.ROOMTYPE as ROOM_TYPE,
        p.PHONENUM as PATIENT_PHONE,
        p.EMAIL as PATIENT_EMAIL
      FROM APPOINTMENTS a
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
      LEFT JOIN STAFF s ON a.STAFFID = s.STAFFID
      LEFT JOIN ROOMS r ON a.ROOMID = r.ROOMID
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

// ----------------- ROLES ROUTES -----------------
// Get all roles
app.get('/api/roles', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        ROLEID as ROLE_ID,
        ROLENAME as ROLE_NAME,
        ROLEDESCRIPTION as ROLE_DESCRIPTION
      FROM ROLES
      ORDER BY ROLEID
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching roles:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: err.message
    });
  }
});

// Add new role
app.post('/api/roles', async (req, res) => {
  const { roleName, roleDescription } = req.body;

  if (!roleName) {
    return res.status(400).json({
      success: false,
      message: 'Role name is required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO ROLES (ROLENAME, ROLEDESCRIPTION)
       VALUES (:roleName, :roleDescription)
       RETURNING ROLEID INTO :id`,
      {
        roleName,
        roleDescription: roleDescription || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Role added successfully',
      roleId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add role',
      error: err.message
    });
  }
});

// Get single role
app.get('/api/roles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        ROLEID as ROLE_ID,
        ROLENAME as ROLE_NAME,
        ROLEDESCRIPTION as ROLE_DESCRIPTION
       FROM ROLES
       WHERE ROLEID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch role',
      error: err.message
    });
  }
});

// Update role
app.put('/api/roles/:id', async (req, res) => {
  const { id } = req.params;
  const { roleName, roleDescription } = req.body;

  try {
    await exec(
      `UPDATE ROLES
       SET ROLENAME = :roleName,
           ROLEDESCRIPTION = :roleDescription
       WHERE ROLEID = :id`,
      { id, roleName, roleDescription }
    );

    res.json({
      success: true,
      message: 'Role updated successfully'
    });
  } catch (err) {
    console.error('Error updating role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update role',
      error: err.message
    });
  }
});

// Delete role
app.delete('/api/roles/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM ROLES WHERE ROLEID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    res.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting role:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete role',
      error: err.message
    });
  }
});

// ----------------- ROOMS ROUTES -----------------
// Get all rooms
app.get('/api/rooms', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        ROOMID as ROOM_ID,
        ROOMTYPE as ROOM_TYPE,
        AVAILABILITYSTATUS as AVAILABILITY_STATUS
      FROM ROOMS
      ORDER BY ROOMID
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: err.message
    });
  }
});

// Add new room
app.post('/api/rooms', async (req, res) => {
  const { roomType, availabilityStatus } = req.body;

  if (!roomType) {
    return res.status(400).json({
      success: false,
      message: 'Room type is required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO ROOMS (ROOMTYPE, AVAILABILITYSTATUS)
       VALUES (:roomType, :availabilityStatus)
       RETURNING ROOMID INTO :id`,
      {
        roomType,
        availabilityStatus: availabilityStatus || 'Available',
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Room added successfully',
      roomId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add room',
      error: err.message
    });
  }
});

// Get single room
app.get('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        ROOMID as ROOM_ID,
        ROOMTYPE as ROOM_TYPE,
        AVAILABILITYSTATUS as AVAILABILITY_STATUS
       FROM ROOMS
       WHERE ROOMID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: err.message
    });
  }
});

// Update room
app.put('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;
  const { roomType, availabilityStatus } = req.body;

  try {
    await exec(
      `UPDATE ROOMS
       SET ROOMTYPE = :roomType,
           AVAILABILITYSTATUS = :availabilityStatus
       WHERE ROOMID = :id`,
      { id, roomType, availabilityStatus }
    );

    res.json({
      success: true,
      message: 'Room updated successfully'
    });
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: err.message
    });
  }
});

// Delete room
app.delete('/api/rooms/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM ROOMS WHERE ROOMID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: err.message
    });
  }
});

// ----------------- STAFF ROUTES -----------------
// Get all staff
app.get('/api/staff', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        s.STAFFID as STAFF_ID,
        s.FIRSTNAME as FIRST_NAME,
        s.LASTNAME as LAST_NAME,
        s.ROLEID as ROLE_ID,
        r.ROLENAME as ROLE_NAME,
        s.PHONENUM as PHONE_NUM,
        s.EMAIL,
        s.HIREDATE as HIRE_DATE,
        s.SHIFT
      FROM STAFF s
      LEFT JOIN ROLES r ON s.ROLEID = r.ROLEID
      ORDER BY s.STAFFID DESC
    `);
    
    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff',
      error: err.message
    });
  }
});

// Add new staff
app.post('/api/staff', async (req, res) => {
  const {
    firstName,
    lastName,
    roleId,
    phoneNum,
    email,
    hireDate,
    shift
  } = req.body;

  if (!firstName || !lastName || !roleId) {
    return res.status(400).json({
      success: false,
      message: 'First name, last name, and role ID are required'
    });
  }

  try {
    const result = await exec(
      `INSERT INTO STAFF
        (FIRSTNAME, LASTNAME, ROLEID, PHONENUM, EMAIL, HIREDATE, SHIFT)
       VALUES
        (:firstName, :lastName, :roleId, :phoneNum, :email, TO_DATE(:hireDate, 'YYYY-MM-DD'), :shift)
       RETURNING STAFFID INTO :id`,
      {
        firstName,
        lastName,
        roleId,
        phoneNum: phoneNum || null,
        email: email || null,
        hireDate: hireDate || null,
        shift: shift || null,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'Staff member added successfully',
      staffId: result.outBinds.id[0]
    });
  } catch (err) {
    console.error('Error adding staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to add staff member',
      error: err.message
    });
  }
});

// Get single staff
app.get('/api/staff/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `SELECT
        STAFFID as STAFF_ID,
        FIRSTNAME as FIRST_NAME,
        LASTNAME as LAST_NAME,
        ROLEID as ROLE_ID,
        PHONENUM as PHONE_NUM,
        EMAIL,
        HIREDATE as HIRE_DATE,
        SHIFT
       FROM STAFF
       WHERE STAFFID = :id`,
      { id }
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff member',
      error: err.message
    });
  }
});

// Update staff
app.put('/api/staff/:id', async (req, res) => {
  const { id } = req.params;
  const {
    firstName,
    lastName,
    roleId,
    phoneNum,
    email,
    hireDate,
    shift
  } = req.body;

  try {
    await exec(
      `UPDATE STAFF
       SET FIRSTNAME = :firstName,
           LASTNAME = :lastName,
           ROLEID = :roleId,
           PHONENUM = :phoneNum,
           EMAIL = :email,
           HIREDATE = TO_DATE(:hireDate, 'YYYY-MM-DD'),
           SHIFT = :shift
       WHERE STAFFID = :id`,
      {
        id,
        firstName,
        lastName,
        roleId,
        phoneNum,
        email,
        hireDate,
        shift
      }
    );

    res.json({
      success: true,
      message: 'Staff member updated successfully'
    });
  } catch (err) {
    console.error('Error updating staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to update staff member',
      error: err.message
    });
  }
});

// Delete staff
app.delete('/api/staff/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await exec(
      `DELETE FROM STAFF WHERE STAFFID = :id`,
      { id }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    res.json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting staff:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to delete staff member',
      error: err.message
    });
  }
});

// ----------------- PRESCRIPTION ROUTES -----------------
// Get all prescriptions
app.get('/api/prescription', async (req, res) => {
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
app.get('/api/prescription/:id', async (req, res) => {
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
app.post('/api/prescription', async (req, res) => {
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
app.delete('/api/prescription/:id', async (req, res) => {
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

// Get medical records (needed for prescription creation)
app.get('/api/medicalrecords', async (req, res) => {
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
app.get('/api/medicalrecords/:id', async (req, res) => {
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
app.post('/api/medicalrecords', async (req, res) => {
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
app.put('/api/medicalrecords/:id', async (req, res) => {
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
app.delete('/api/medicalrecords/:id', async (req, res) => {
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

// ----------------- INVOICE ROUTES -----------------
// Get all invoices
app.get('/api/invoice', async (req, res) => {
  try {
    const result = await exec(`
      SELECT 
        i.INVOICEID,
        i.APPOINTMENTID,
        i.TOTALAMOUNT,
        i.PAYMENTMETHOD,
        i.DATEPAID,
        a.APPOINTMENTDATE,
        a.PATIENTIC as PATIENT_IC,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        CASE WHEN i.DATEPAID IS NOT NULL THEN 'Paid' ELSE 'Pending' END as PAYMENT_STATUS
      FROM INVOICE i
      JOIN APPOINTMENTS a ON i.APPOINTMENTID = a.APPOINTMENTID
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
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
app.get('/api/invoice/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await exec(`
      SELECT 
        i.INVOICEID,
        i.APPOINTMENTID,
        i.TOTALAMOUNT,
        i.PAYMENTMETHOD,
        i.DATEPAID,
        a.APPOINTMENTDATE,
        a.PATIENTIC as PATIENT_IC,
        p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME,
        d.FIRSTNAME || ' ' || d.LASTNAME as DOCTOR_NAME,
        a.REASONTOVISIT as REASON_TO_VISIT,
        CASE WHEN i.DATEPAID IS NOT NULL THEN 'Paid' ELSE 'Pending' END as PAYMENT_STATUS
      FROM INVOICE i
      JOIN APPOINTMENTS a ON i.APPOINTMENTID = a.APPOINTMENTID
      JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC
      JOIN DOCTORS d ON a.DOCTORID = d.DOCTORID
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

// Get prescription medicine cost for an appointment
app.get('/api/appointment/:id/prescription-cost', async (req, res) => {
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

// Create new invoice
app.post('/api/invoice', async (req, res) => {
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
    
    // If totalamount is provided, use it; otherwise use only medicine cost
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
app.put('/api/invoice/:id', async (req, res) => {
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
app.delete('/api/invoice/:id', async (req, res) => {
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

// ----------------- SQL QUERY CONSOLE -----------------
// Execute custom SQL query (for admin/development use)
app.post('/api/query', async (req, res) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Query is required'
    });
  }

  // Basic security: prevent certain dangerous operations
  const dangerousKeywords = ['DROP DATABASE', 'DROP USER', 'CREATE USER', 'ALTER USER', 'GRANT', 'REVOKE'];
  const upperQuery = query.trim().toUpperCase();
  
  for (const keyword of dangerousKeywords) {
    if (upperQuery.includes(keyword)) {
      return res.status(403).json({
        success: false,
        message: `Query contains forbidden keyword: ${keyword}`
      });
    }
  }

  // Detect query type
  let queryType = 'UNKNOWN';
  if (upperQuery.startsWith('SELECT')) queryType = 'SELECT';
  else if (upperQuery.startsWith('INSERT')) queryType = 'INSERT';
  else if (upperQuery.startsWith('UPDATE')) queryType = 'UPDATE';
  else if (upperQuery.startsWith('DELETE')) queryType = 'DELETE';
  else if (upperQuery.startsWith('CREATE')) queryType = 'CREATE';
  else if (upperQuery.startsWith('ALTER')) queryType = 'ALTER';
  else if (upperQuery.startsWith('DROP')) queryType = 'DROP';

  try {
    const result = await exec(query);
    
    // Extract column names from the result metadata (for SELECT queries)
    const columns = result.metaData ? result.metaData.map(col => col.name) : [];
    
    // For non-SELECT queries, return rows affected
    const rowsAffected = result.rowsAffected || 0;
    
    res.json({
      success: true,
      queryType: queryType,
      columns: columns,
      rows: result.rows || [],
      rowCount: result.rows ? result.rows.length : 0,
      rowsAffected: queryType !== 'SELECT' ? rowsAffected : undefined,
      message: 'Query executed successfully'
    });
  } catch (err) {
    console.error('Error executing query:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to execute query',
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