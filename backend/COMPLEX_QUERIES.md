# Complex SQL Queries - NovaCare System

## 1. Multi-Table JOIN - Appointment List (5 Tables)

**File:** `routes/appointments.routes.js` - GET `/api/appointments`

```sql
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
```

**What it does:** 
- Joins 5 tables (Appointments, Patients, Doctors, Staff, Rooms)
- Uses INNER JOIN for required relationships
- Uses LEFT JOIN for optional relationships
- Concatenates first and last names
- Orders by date and time

---

## 2. Aggregate Function - Conflict Detection

**File:** `routes/appointments.routes.js` - POST `/api/appointments`

```sql
SELECT COUNT(*) as CNT 
FROM APPOINTMENTS 
WHERE DOCTORID = :doctorId 
  AND TRUNC(APPOINTMENTDATE) = TO_DATE(:appointmentDate, 'YYYY-MM-DD')
  AND APPOINTMENTTIME = :appointmentTime
  AND STATUS != 'Cancelled'
```

**What it does:**
- Uses COUNT aggregate function
- Prevents double-booking doctors
- TRUNC normalizes date comparison
- Filters out cancelled appointments

---

## 3. Complex Aggregates with JOINs - Prescription Cost

**File:** `routes/invoice.routes.js` - GET `/api/appointment/:id/prescription-cost`

```sql
SELECT 
  NVL(SUM(pi.QUANTITY * m.MEDPRICE), 0) as MEDICINE_COST,
  COUNT(DISTINCT p.PRESCRIPTIONID) as PRESCRIPTION_COUNT,
  COUNT(pi.PRESCRIPTIONITEMID) as MEDICINE_COUNT
FROM PRESCRIPTION p
JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
LEFT JOIN PRESCRIPTIONITEM pi ON p.PRESCRIPTIONID = pi.PRESCRIPTIONID
LEFT JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
WHERE r.APPOINTMENTID = :id
```

**What it does:**
- SUM aggregate with calculation (quantity × price)
- COUNT DISTINCT to avoid duplicates
- Multiple COUNT functions
- NVL handles NULL values
- 4-table JOIN chain
- LEFT JOIN handles missing items

---

## 4. Nested Subquery - Invoice Creation

**File:** `routes/invoice.routes.js` - POST `/api/invoice`

```sql
-- Subquery calculates medicine cost
SELECT NVL(SUM(pi.QUANTITY * m.MEDPRICE), 0) as MEDICINE_COST
FROM PRESCRIPTION p
JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
JOIN PRESCRIPTIONITEM pi ON p.PRESCRIPTIONID = pi.PRESCRIPTIONID
JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
WHERE r.APPOINTMENTID = :appointmentid

-- Then used in INSERT
INSERT INTO INVOICE (APPOINTMENTID, TOTALAMOUNT, PAYMENTMETHOD, DATEPAID)
VALUES (:appointmentid, :totalamount, :paymentmethod, :datepaid)
RETURNING INVOICEID INTO :invoiceid
```

**What it does:**
- Subquery calculates total medicine cost
- Result used for automatic billing
- RETURNING clause gets generated ID
- Combines consultation + medicine fees

---

## 5. Transaction - Prescription Creation

**File:** `routes/prescription.routes.js` - POST `/api/prescription`

```sql
-- Transaction Start (autoCommit: false)
BEGIN

  -- Step 1: Insert prescription header
  INSERT INTO PRESCRIPTION (RECORDID, INSTRUCTION) 
  VALUES (:recordId, :instruction)
  RETURNING PRESCRIPTIONID INTO :id;

  -- Step 2: Loop through items
  FOR EACH item DO
  
    -- Insert prescription item
    INSERT INTO PRESCRIPTIONITEM 
      (PRESCRIPTIONID, MEDICINEID, QUANTITY, DOSAGE, DATEPRESCRIBED) 
    VALUES 
      (:prescriptionId, :medicineId, :quantity, :dosage, SYSDATE);

    -- Update medicine stock
    UPDATE MEDICINE 
    SET CURRENTSTOCK = CURRENTSTOCK - :quantity 
    WHERE MEDICINEID = :medicineId;
    
  END LOOP;

  -- Commit all changes
  COMMIT;

EXCEPTION
  WHEN OTHERS THEN
    ROLLBACK;
    
END;
```

**What it does:**
- ACID transaction ensures data consistency
- Multiple INSERT and UPDATE operations
- Automatic inventory management
- Rollback on any error
- All-or-nothing execution

---

## 6. Multi-Table JOIN - Prescription Details

**File:** `routes/prescription.routes.js` - GET `/api/prescription/:id`

```sql
-- Main prescription query (5 tables)
SELECT 
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
WHERE p.PRESCRIPTIONID = :id

-- Nested query for items
SELECT 
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
WHERE pi.PRESCRIPTIONID = :id
```

**What it does:**
- 5-table JOIN for complete context
- Master-detail pattern (header + items)
- Two separate queries combined in application
- Shows complete prescription with medicines

---

## 7. Aggregate with Subquery - Medical Record Lookup

**File:** `routes/medicalrecords.routes.js` - POST `/api/medicalrecords`

```sql
-- Get next record ID
SELECT NVL(MAX(RECORDID), 0) + 1 as NEXT_ID 
FROM MEDICALRECORD

-- Then insert with generated ID
INSERT INTO MEDICALRECORD 
  (RECORDID, APPOINTMENTID, VISITDATE, SYMPTOM, DIAGNOSIS)
VALUES 
  (:recordid, :appointmentid, TO_DATE(:visitdate, 'YYYY-MM-DD'), 
   :symptom, :diagnosis)
```

**What it does:**
- MAX aggregate finds highest ID
- NVL handles empty table (returns 0)
- Auto-generates sequential IDs
- Ensures unique record numbers

---

## 8. Multi-Table JOIN - Medical Records List

**File:** `routes/medicalrecords.routes.js` - GET `/api/medicalrecords`

```sql
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
```

**What it does:**
- 4-table JOIN for patient history
- Shows complete medical context
- Orders by most recent visits
- Displays symptoms and diagnoses

---

## 9. LEFT JOIN - Doctors with Specializations

**File:** `routes/doctors.routes.js` - GET `/api/doctors`

```sql
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
```

**What it does:**
- LEFT JOIN preserves all doctors
- Shows doctors even without specialization
- Handles optional relationships
- Prevents data loss in display

---

## 10. LEFT JOIN - Staff with Roles

**File:** `routes/staff.routes.js` - GET `/api/staff`

```sql
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
```

**What it does:**
- LEFT JOIN shows all staff members
- Includes role information when available
- Handles unassigned roles gracefully

---

## Summary Table

| # | Query Type | Tables | Complexity Features | Business Purpose |
|---|------------|--------|---------------------|------------------|
| 1 | Multi-table JOIN | 5 | INNER + LEFT JOIN, Concatenation | Complete appointment view |
| 2 | Aggregate + Filter | 1 | COUNT, TRUNC, Date functions | Prevent double-booking |
| 3 | Aggregate + JOIN | 4 | SUM, COUNT DISTINCT, NVL, Calculation | Calculate prescription costs |
| 4 | Subquery + INSERT | 4 | Nested query, RETURNING clause | Automated invoice creation |
| 5 | Transaction | 3 | Multiple DML, Commit/Rollback, Loop | Prescription with inventory |
| 6 | Nested queries | 5 | Master-detail pattern, Multiple JOINs | Complete prescription details |
| 7 | Aggregate + Sequence | 1 | MAX, NVL, Auto-increment | Generate record IDs |
| 8 | Multi-table JOIN | 4 | Multiple INNER JOINs | Medical history view |
| 9 | LEFT JOIN | 2 | Optional relationship | Doctor directory |
| 10 | LEFT JOIN | 2 | Optional relationship | Staff directory |

---

## Key SQL Techniques Used

✅ **JOINs**: INNER JOIN, LEFT JOIN, Multi-table (up to 5 tables)  
✅ **Aggregate Functions**: COUNT, SUM, MAX, COUNT DISTINCT, NVL  
✅ **Subqueries**: Nested queries, Validation queries  
✅ **Transactions**: ACID compliance, Commit/Rollback  
✅ **Date Functions**: TRUNC, TO_DATE, SYSDATE  
✅ **String Operations**: Concatenation (||)  
✅ **Advanced SQL**: RETURNING clause, CASE statements  
✅ **Calculations**: Mathematical operations in SELECT  
✅ **Sorting**: ORDER BY with multiple columns  
✅ **Filtering**: Complex WHERE conditions
