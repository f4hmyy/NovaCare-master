# API Structure Overview

## Before (Monolithic)
```
server.js (2523 lines)
├── Database Config
├── Middleware Setup
├── 58 API Endpoints
└── Error Handlers
```

## After (Modular)
```
backend/
│
├── server.js (178 lines)                    ← Main entry point
│   ├── Imports all routes
│   ├── Sets up middleware
│   └── Mounts routes
│
├── config/
│   └── database.js                          ← Database configuration
│       ├── initializeDB()
│       ├── exec()
│       └── oracledb export
│
└── routes/                                   ← Route modules
    ├── test.routes.js                       (2 endpoints)
    ├── testdb.routes.js                     (1 endpoint)
    ├── specializations.routes.js            (3 endpoints)
    ├── doctors.routes.js                    (5 endpoints)
    ├── patients.routes.js                   (5 endpoints)
    ├── appointments.routes.js               (7 endpoints)
    ├── roles.routes.js                      (5 endpoints)
    ├── rooms.routes.js                      (5 endpoints)
    ├── staff.routes.js                      (5 endpoints)
    ├── prescription.routes.js               (3 endpoints)
    ├── medicalrecords.routes.js             (5 endpoints)
    ├── medicine.routes.js                   (5 endpoints)
    ├── invoice.routes.js                    (6 endpoints)
    └── query.routes.js                      (1 endpoint)
```

## Route Organization by Resource

| Resource | File | Endpoints | Lines |
|----------|------|-----------|-------|
| Test | test.routes.js | 2 | ~20 |
| Database Test | testdb.routes.js | 1 | ~30 |
| Specializations | specializations.routes.js | 3 | ~100 |
| Doctors | doctors.routes.js | 5 | ~210 |
| Patients | patients.routes.js | 5 | ~240 |
| Appointments | appointments.routes.js | 7 | ~360 |
| Roles | roles.routes.js | 5 | ~165 |
| Rooms | rooms.routes.js | 5 | ~160 |
| Staff | staff.routes.js | 5 | ~220 |
| Prescriptions | prescription.routes.js | 3 | ~240 |
| Medical Records | medicalrecords.routes.js | 5 | ~215 |
| Medicine | medicine.routes.js | 5 | ~215 |
| Invoices | invoice.routes.js | 6 | ~235 |
| Query | query.routes.js | 1 | ~75 |

## Code Reduction

**Before:**
- 1 file with 2523 lines
- Hard to navigate
- Difficult to maintain

**After:**
- 16 files with ~2500 lines total
- Average ~160 lines per file
- Easy to find and modify specific APIs
- Clear separation of concerns

## Import/Export Flow

```
┌─────────────┐
│  server.js  │
└──────┬──────┘
       │
       ├─────────────────────┐
       │                     │
       v                     v
┌─────────────┐      ┌──────────────┐
│ config/     │      │ routes/      │
│ database.js │◄─────┤ *.routes.js  │
└─────────────┘      └──────────────┘
       │
       │ (exec, oracledb)
       │
       └─────────────────────┘
```

## Benefits Summary

✅ **Modularity** - Each API has its own file
✅ **Maintainability** - Easy to locate and fix issues
✅ **Scalability** - Simple to add new endpoints
✅ **Readability** - Cleaner, more organized code
✅ **Team Collaboration** - Multiple developers can work on different routes
✅ **Testing** - Each route can be tested independently
✅ **Reusability** - Shared database configuration

## Quick Reference

**Add new endpoint to existing resource:**
1. Open the relevant `routes/*.routes.js` file
2. Add your route handler
3. No changes needed in server.js

**Add new resource:**
1. Create `routes/newresource.routes.js`
2. Import in `server.js`: `const newRoutes = require('./routes/newresource.routes');`
3. Mount in `server.js`: `app.use('/api/newresource', newRoutes);`
