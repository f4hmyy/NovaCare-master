# Backend API - Modular Structure

This backend has been refactored from a monolithic `server.js` file into a modular structure with separate route files for better organization and maintainability.

## 📁 Project Structure

```
backend/
├── server.js                          # Main entry point - imports and mounts all routes
├── server.old.js                      # Backup of original monolithic server.js
├── config/
│   └── database.js                    # Database configuration and helper functions
└── routes/
    ├── test.routes.js                 # Test API routes
    ├── testdb.routes.js               # Database connection test routes
    ├── specializations.routes.js      # Specialization management
    ├── doctors.routes.js              # Doctor management
    ├── patients.routes.js             # Patient management
    ├── appointments.routes.js         # Appointment scheduling
    ├── roles.routes.js                # Role management
    ├── rooms.routes.js                # Room management
    ├── staff.routes.js                # Staff management
    ├── prescription.routes.js         # Prescription management
    ├── medicalrecords.routes.js       # Medical records management
    ├── medicine.routes.js             # Medicine inventory
    ├── invoice.routes.js              # Invoicing and payments
    └── query.routes.js                # Custom SQL query execution
```

## 🚀 How It Works

### Database Configuration (`config/database.js`)
- Exports `initializeDB()` - Initializes Oracle connection pool
- Exports `exec()` - Helper function for executing queries
- Exports `oracledb` - Oracle database module reference

### Main Server (`server.js`)
- Sets up Express middleware (CORS, body parser, logger)
- Imports all route modules
- Mounts routes under `/api` prefix
- Handles errors with 404 and global error handlers
- Manages graceful shutdown

### Route Files (`routes/*.routes.js`)
Each route file:
- Uses Express Router
- Handles specific resource endpoints (GET, POST, PUT, DELETE, PATCH)
- Imports database helpers from `config/database.js`
- Exports the router for mounting in main server

## 📋 API Endpoints

### Test Routes
- `GET /api/test` - API health check
- `GET /api/test/db` - Database connection test

### Specializations
- `GET /api/specializations` - List all specializations
- `POST /api/specializations` - Add new specialization
- `DELETE /api/specializations/:id` - Delete specialization

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Add new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Patients
- `GET /api/patients` - List all patients
- `GET /api/patients/:ic` - Get single patient
- `POST /api/patients` - Add new patient
- `PUT /api/patients/:ic` - Update patient
- `DELETE /api/patients/:ic` - Delete patient

### Appointments
- `GET /api/appointments` - List all appointments
- `GET /api/appointments/date/:date` - Get appointments by date
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `PATCH /api/appointments/:id/status` - Update appointment status
- `DELETE /api/appointments/:id` - Delete appointment

### Roles
- `GET /api/roles` - List all roles
- `GET /api/roles/:id` - Get single role
- `POST /api/roles` - Add new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Rooms
- `GET /api/rooms` - List all rooms
- `GET /api/rooms/:id` - Get single room
- `POST /api/rooms` - Add new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Staff
- `GET /api/staff` - List all staff
- `GET /api/staff/:id` - Get single staff member
- `POST /api/staff` - Add new staff member
- `PUT /api/staff/:id` - Update staff member
- `DELETE /api/staff/:id` - Delete staff member

### Prescriptions
- `GET /api/prescription` - List all prescriptions
- `GET /api/prescription/:id` - Get prescription with items
- `POST /api/prescription` - Create prescription with items
- `DELETE /api/prescription/:id` - Delete prescription

### Medical Records
- `GET /api/medicalrecords` - List all medical records
- `GET /api/medicalrecords/:id` - Get single medical record
- `POST /api/medicalrecords` - Create medical record
- `PUT /api/medicalrecords/:id` - Update medical record
- `DELETE /api/medicalrecords/:id` - Delete medical record

### Medicine
- `GET /api/medicine` - List all medicines
- `GET /api/medicine/:id` - Get single medicine
- `POST /api/medicine` - Add new medicine
- `PUT /api/medicine/:id` - Update medicine
- `DELETE /api/medicine/:id` - Delete medicine

### Invoices
- `GET /api/invoice` - List all invoices
- `GET /api/invoice/:id` - Get single invoice
- `GET /api/appointment/:id/prescription-cost` - Get prescription cost for appointment
- `POST /api/invoice` - Create invoice
- `PUT /api/invoice/:id` - Update invoice
- `DELETE /api/invoice/:id` - Delete invoice

### Query Console
- `POST /api/query` - Execute custom SQL query (admin/dev only)

## 🔧 How to Add New Routes

1. Create a new route file in `routes/` directory:
```javascript
const express = require('express');
const router = express.Router();
const { exec, oracledb } = require('../config/database');

router.get('/', async (req, res) => {
  // Your route logic here
});

module.exports = router;
```

2. Import the route in `server.js`:
```javascript
const newRoutes = require('./routes/new.routes');
```

3. Mount the route:
```javascript
app.use('/api/new', newRoutes);
```

## ✅ Benefits of This Structure

1. **Separation of Concerns** - Each route file handles one resource
2. **Maintainability** - Easier to find and fix bugs
3. **Scalability** - Easy to add new endpoints
4. **Readability** - Cleaner, more organized code
5. **Testability** - Each route can be tested independently
6. **Reusability** - Shared database config and helpers

## 🔄 Migration Notes

- The original `server.js` is backed up as `server.old.js`
- All endpoints remain at the same URLs - no breaking changes
- All functionality has been preserved
- Database connection pooling works the same way

## 🚦 Running the Server

```bash
# Install dependencies
npm install

# Start server
npm start

# Or use nodemon for development
nodemon server.js
```

## 📝 Environment Variables

```env
PORT=5000
CLIENT_URL=http://localhost:3000
DB_USER=Novacare
DB_PASSWORD=oracle
DB_CONNECT_STRING=localhost:1521/freepdb1
NODE_ENV=development
```
