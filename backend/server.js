const express = require('express');
const cors = require('cors');
const { initializeDB, oracledb } = require('./config/database');

// Import route modules
const testRoutes = require('./routes/test.routes');
const testdbRoutes = require('./routes/testdb.routes');
const specializationsRoutes = require('./routes/specializations.routes');
const doctorsRoutes = require('./routes/doctors.routes');
const patientsRoutes = require('./routes/patients.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const rolesRoutes = require('./routes/roles.routes');
const roomsRoutes = require('./routes/rooms.routes');
const staffRoutes = require('./routes/staff.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const medicalrecordsRoutes = require('./routes/medicalrecords.routes');
const medicineRoutes = require('./routes/medicine.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const queryRoutes = require('./routes/query.routes');

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

// ----------------- ROUTES -----------------
// Mount route modules
app.use('/api/test', testRoutes);
app.use('/api/test', testdbRoutes);
app.use('/api/specializations', specializationsRoutes);
app.use('/api/doctors', doctorsRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/prescription', prescriptionRoutes);
app.use('/api/medicalrecords', medicalrecordsRoutes);
app.use('/api/medicine', medicineRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/query', queryRoutes);

// Special route for appointment prescription cost (keep in main server for now)
app.get('/api/appointment/:id/prescription-cost', async (req, res) => {
  const { exec } = require('./config/database');
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
const { exec } = require('./config/database');
module.exports = { app, exec };
