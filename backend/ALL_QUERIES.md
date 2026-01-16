# All SQL Queries - NovaCare Hospital Management System

Complete list of all SQL queries used in the project, organized by table/feature.

---

## 1. SPECIALIZATIONS (3 queries)

### 1.1 Get All Specializations
**File:** `routes/specializations.routes.js` - GET `/api/specializations`
```sql
SELECT SPECIALIZATIONID as ID, 
       SPECIALIZATIONTYPE as NAME,
       SPEC_DESC as DESCRIPTION
FROM SPECIALIZATION 
ORDER BY SPECIALIZATIONTYPE
```
**Purpose:** Display all medical specializations for doctor assignment dropdown

---

### 1.2 Add Specialization
**File:** `routes/specializations.routes.js` - POST `/api/specializations`
```sql
INSERT INTO SPECIALIZATION (SPECIALIZATIONTYPE, SPEC_DESC) 
VALUES (:name, :description)
RETURNING SPECIALIZATIONID INTO :id
```
**Purpose:** Create new specialization (e.g., Cardiology, Pediatrics)

---

### 1.3 Delete Specialization
**File:** `routes/specializations.routes.js` - DELETE `/api/specializations/:id`
```sql
DELETE FROM SPECIALIZATION 
WHERE SPECIALIZATIONID = :id
```
**Purpose:** Remove unused specialization

---

## 2. DOCTORS (5 queries)

### 2.1 Get All Doctors
**File:** `routes/doctors.routes.js` - GET `/api/doctors`
```sql
SELECT d.DOCTORID as DOCTOR_ID, 
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
**Purpose:** Display doctor directory with specializations

---

### 2.2 Add Doctor
**File:** `routes/doctors.routes.js` - POST `/api/doctors`
```sql
INSERT INTO DOCTORS 
  (FIRSTNAME, LASTNAME, SPECIALIZATIONID, EMAIL, PHONENUM, LICENSENUM, STATUS) 
VALUES 
  (:firstName, :lastName, :specialization, :email, :phone, :licenseNum, 'Active')
RETURNING DOCTORID INTO :id
```
**Purpose:** Register new doctor in the system

---

### 2.3 Get Single Doctor
**File:** `routes/doctors.routes.js` - GET `/api/doctors/:id`
```sql
SELECT DOCTORID as DOCTOR_ID, 
       FIRSTNAME as FIRST_NAME, 
       LASTNAME as LAST_NAME, 
       SPECIALIZATIONID as SPECIALIZATION, 
       EMAIL, 
       PHONENUM as PHONE, 
       LICENSENUM as LICENSE_NUMBER,
       STATUS
FROM DOCTORS 
WHERE DOCTORID = :id
```
**Purpose:** View individual doctor details

---

### 2.4 Update Doctor
**File:** `routes/doctors.routes.js` - PUT `/api/doctors/:id`
```sql
UPDATE DOCTORS 
SET FIRSTNAME = :firstName,
    LASTNAME = :lastName,
    EMAIL = :email,
    PHONENUM = :phone,
    LICENSENUM = :licenseNum
WHERE DOCTORID = :id
```
**Purpose:** Edit doctor information

---

### 2.5 Delete Doctor
**File:** `routes/doctors.routes.js` - DELETE `/api/doctors/:id`
```sql
DELETE FROM DOCTORS 
WHERE DOCTORID = :id
```
**Purpose:** Remove doctor from system

---

## 3. PATIENTS (5 queries)

### 3.1 Get All Patients
**File:** `routes/patients.routes.js` - GET `/api/patients`
```sql
SELECT PATIENTIC as PATIENT_IC,
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
```
**Purpose:** Display patient registry

---

### 3.2 Add Patient
**File:** `routes/patients.routes.js` - POST `/api/patients`
```sql
INSERT INTO PATIENTS 
  (PATIENTIC, FIRSTNAME, LASTNAME, DATEOFBIRTH, GENDER, PHONENUM, 
   EMAIL, ADDRESS, EMERGENCYCONTACT, BLOODTYPE, ALLERGIES) 
VALUES 
  (:patientIC, :firstName, :lastName, TO_DATE(:dob, 'YYYY-MM-DD'), 
   :gender, :phone, :email, :address, :emergencyContact, :bloodType, :allergies)
```
**Purpose:** Register new patient with complete medical information

---

### 3.3 Get Single Patient
**File:** `routes/patients.routes.js` - GET `/api/patients/:ic`
```sql
SELECT PATIENTIC as PATIENT_IC,
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
WHERE PATIENTIC = :ic
```
**Purpose:** View individual patient profile

---

### 3.4 Update Patient
**File:** `routes/patients.routes.js` - PUT `/api/patients/:ic`
```sql
UPDATE PATIENTS 
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
WHERE PATIENTIC = :ic
```
**Purpose:** Update patient information

---

### 3.5 Delete Patient
**File:** `routes/patients.routes.js` - DELETE `/api/patients/:ic`
```sql
DELETE FROM PATIENTS 
WHERE PATIENTIC = :ic
```
**Purpose:** Remove patient from system

---

## 4. APPOINTMENTS (7 queries)

### 4.1 Get All Appointments
**File:** `routes/appointments.routes.js` - GET `/api/appointments`
```sql
SELECT a.APPOINTMENTID as APPOINTMENT_ID,
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
**Purpose:** Display complete appointment calendar with all details

---

### 4.2 Get Appointments by Date
**File:** `routes/appointments.routes.js` - GET `/api/appointments/date/:date`
```sql
SELECT a.APPOINTMENTID as APPOINTMENT_ID,
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
ORDER BY a.APPOINTMENTTIME
```
**Purpose:** Show daily schedule for specific date

---

### 4.3 Check Appointment Conflict
**File:** `routes/appointments.routes.js` - POST `/api/appointments` (validation)
```sql
SELECT COUNT(*) as CNT 
FROM APPOINTMENTS 
WHERE DOCTORID = :doctorId 
  AND TRUNC(APPOINTMENTDATE) = TO_DATE(:appointmentDate, 'YYYY-MM-DD')
  AND APPOINTMENTTIME = :appointmentTime
  AND STATUS != 'Cancelled'
```
**Purpose:** Prevent double-booking by checking time slot availability

---

### 4.4 Create Appointment
**File:** `routes/appointments.routes.js` - POST `/api/appointments`
```sql
INSERT INTO APPOINTMENTS 
  (STAFFID, PATIENTIC, DOCTORID, ROOMID, APPOINTMENTDATE, 
   APPOINTMENTTIME, REASONTOVISIT, STATUS) 
VALUES 
  (:staffId, :patientIC, :doctorId, :roomId, 
   TO_DATE(:appointmentDate, 'YYYY-MM-DD'), :appointmentTime, 
   :reasonToVisit, 'Scheduled')
RETURNING APPOINTMENTID INTO :appointmentId
```
**Purpose:** Book new appointment

---

### 4.5 Get Single Appointment
**File:** `routes/appointments.routes.js` - GET `/api/appointments/:id`
```sql
SELECT a.APPOINTMENTID as APPOINTMENT_ID,
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
WHERE a.APPOINTMENTID = :id
```
**Purpose:** View detailed appointment information

---

### 4.6 Update Appointment Status
**File:** `routes/appointments.routes.js` - PATCH `/api/appointments/:id/status`
```sql
UPDATE APPOINTMENTS 
SET STATUS = :status
WHERE APPOINTMENTID = :id
```
**Purpose:** Change appointment status (Scheduled/Completed/Cancelled)

---

### 4.7 Update Appointment
**File:** `routes/appointments.routes.js` - PUT `/api/appointments/:id`
```sql
UPDATE APPOINTMENTS 
SET STAFFID = :staffId,
    PATIENTIC = :patientIC,
    DOCTORID = :doctorId,
    ROOMID = :roomId,
    APPOINTMENTDATE = TO_DATE(:date, 'YYYY-MM-DD'),
    APPOINTMENTTIME = :time,
    STATUS = :status,
    REASONTOVISIT = :reasonToVisit
WHERE APPOINTMENTID = :id
```
**Purpose:** Edit appointment details

---

### 4.8 Delete Appointment
**File:** `routes/appointments.routes.js` - DELETE `/api/appointments/:id`
```sql
DELETE FROM APPOINTMENTS 
WHERE APPOINTMENTID = :id
```
**Purpose:** Cancel and remove appointment

---

## 5. ROLES (5 queries)

### 5.1 Get All Roles
**File:** `routes/roles.routes.js` - GET `/api/roles`
```sql
SELECT ROLEID as ROLE_ID,
       ROLENAME as ROLE_NAME,
       ROLEDESCRIPTION as ROLE_DESCRIPTION
FROM ROLES
ORDER BY ROLEID
```
**Purpose:** List all staff roles

---

### 5.2 Add Role
**File:** `routes/roles.routes.js` - POST `/api/roles`
```sql
INSERT INTO ROLES (ROLENAME, ROLEDESCRIPTION)
VALUES (:roleName, :roleDescription)
RETURNING ROLEID INTO :id
```
**Purpose:** Create new staff role

---

### 5.3 Get Single Role
**File:** `routes/roles.routes.js` - GET `/api/roles/:id`
```sql
SELECT ROLEID as ROLE_ID,
       ROLENAME as ROLE_NAME,
       ROLEDESCRIPTION as ROLE_DESCRIPTION
FROM ROLES
WHERE ROLEID = :id
```
**Purpose:** View role details

---

### 5.4 Update Role
**File:** `routes/roles.routes.js` - PUT `/api/roles/:id`
```sql
UPDATE ROLES
SET ROLENAME = :roleName,
    ROLEDESCRIPTION = :roleDescription
WHERE ROLEID = :id
```
**Purpose:** Edit role information

---

### 5.5 Delete Role
**File:** `routes/roles.routes.js` - DELETE `/api/roles/:id`
```sql
DELETE FROM ROLES 
WHERE ROLEID = :id
```
**Purpose:** Remove role

---

## 6. ROOMS (5 queries)

### 6.1 Get All Rooms
**File:** `routes/rooms.routes.js` - GET `/api/rooms`
```sql
SELECT ROOMID as ROOM_ID,
       ROOMTYPE as ROOM_TYPE,
       AVAILABILITYSTATUS as AVAILABILITY_STATUS
FROM ROOMS
ORDER BY ROOMID
```
**Purpose:** Display room inventory and availability

---

### 6.2 Add Room
**File:** `routes/rooms.routes.js` - POST `/api/rooms`
```sql
INSERT INTO ROOMS (ROOMTYPE, AVAILABILITYSTATUS)
VALUES (:roomType, :availabilityStatus)
RETURNING ROOMID INTO :id
```
**Purpose:** Add new room to system

---

### 6.3 Get Single Room
**File:** `routes/rooms.routes.js` - GET `/api/rooms/:id`
```sql
SELECT ROOMID as ROOM_ID,
       ROOMTYPE as ROOM_TYPE,
       AVAILABILITYSTATUS as AVAILABILITY_STATUS
FROM ROOMS
WHERE ROOMID = :id
```
**Purpose:** View room details

---

### 6.4 Update Room
**File:** `routes/rooms.routes.js` - PUT `/api/rooms/:id`
```sql
UPDATE ROOMS
SET ROOMTYPE = :roomType,
    AVAILABILITYSTATUS = :availabilityStatus
WHERE ROOMID = :id
```
**Purpose:** Edit room information and availability

---

### 6.5 Delete Room
**File:** `routes/rooms.routes.js` - DELETE `/api/rooms/:id`
```sql
DELETE FROM ROOMS 
WHERE ROOMID = :id
```
**Purpose:** Remove room

---

## 7. STAFF (5 queries)

### 7.1 Get All Staff
**File:** `routes/staff.routes.js` - GET `/api/staff`
```sql
SELECT s.STAFFID as STAFF_ID,
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
**Purpose:** Display staff directory with roles

---

### 7.2 Add Staff
**File:** `routes/staff.routes.js` - POST `/api/staff`
```sql
INSERT INTO STAFF
  (FIRSTNAME, LASTNAME, ROLEID, PHONENUM, EMAIL, HIREDATE, SHIFT)
VALUES
  (:firstName, :lastName, :roleId, :phoneNum, :email, 
   TO_DATE(:hireDate, 'YYYY-MM-DD'), :shift)
RETURNING STAFFID INTO :id
```
**Purpose:** Register new staff member

---

### 7.3 Get Single Staff
**File:** `routes/staff.routes.js` - GET `/api/staff/:id`
```sql
SELECT STAFFID as STAFF_ID,
       FIRSTNAME as FIRST_NAME,
       LASTNAME as LAST_NAME,
       ROLEID as ROLE_ID,
       PHONENUM as PHONE_NUM,
       EMAIL,
       HIREDATE as HIRE_DATE,
       SHIFT
FROM STAFF
WHERE STAFFID = :id
```
**Purpose:** View staff member details

---

### 7.4 Update Staff
**File:** `routes/staff.routes.js` - PUT `/api/staff/:id`
```sql
UPDATE STAFF
SET FIRSTNAME = :firstName,
    LASTNAME = :lastName,
    ROLEID = :roleId,
    PHONENUM = :phoneNum,
    EMAIL = :email,
    HIREDATE = TO_DATE(:hireDate, 'YYYY-MM-DD'),
    SHIFT = :shift
WHERE STAFFID = :id
```
**Purpose:** Edit staff information

---

### 7.5 Delete Staff
**File:** `routes/staff.routes.js` - DELETE `/api/staff/:id`
```sql
DELETE FROM STAFF 
WHERE STAFFID = :id
```
**Purpose:** Remove staff member

---

## 8. PRESCRIPTIONS (6 queries)

### 8.1 Get All Prescriptions
**File:** `routes/prescription.routes.js` - GET `/api/prescription`
```sql
SELECT p.PRESCRIPTIONID,
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
```
**Purpose:** Display prescription history with patient/doctor context

---

### 8.2 Get Prescription with Items (Header)
**File:** `routes/prescription.routes.js` - GET `/api/prescription/:id`
```sql
SELECT p.PRESCRIPTIONID,
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
```
**Purpose:** Get prescription header with complete context

---

### 8.3 Get Prescription Items (Details)
**File:** `routes/prescription.routes.js` - GET `/api/prescription/:id`
```sql
SELECT pi.PRESCRIPTIONITEMID,
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
**Purpose:** Get all medicines in a prescription

---

### 8.4 Create Prescription (Transaction - Step 1)
**File:** `routes/prescription.routes.js` - POST `/api/prescription`
```sql
INSERT INTO PRESCRIPTION (RECORDID, INSTRUCTION) 
VALUES (:recordId, :instruction)
RETURNING PRESCRIPTIONID INTO :id
```
**Purpose:** Create prescription header

---

### 8.5 Create Prescription Items (Transaction - Step 2)
**File:** `routes/prescription.routes.js` - POST `/api/prescription`
```sql
INSERT INTO PRESCRIPTIONITEM 
  (PRESCRIPTIONID, MEDICINEID, QUANTITY, DOSAGE, DATEPRESCRIBED) 
VALUES 
  (:prescriptionId, :medicineId, :quantity, :dosage, SYSDATE)
```
**Purpose:** Add medicine to prescription (loops for each item)

---

### 8.6 Update Medicine Stock (Transaction - Step 3)
**File:** `routes/prescription.routes.js` - POST `/api/prescription`
```sql
UPDATE MEDICINE 
SET CURRENTSTOCK = CURRENTSTOCK - :quantity 
WHERE MEDICINEID = :medicineId
```
**Purpose:** Automatically decrease inventory when medicine prescribed

---

### 8.7 Delete Prescription Items
**File:** `routes/prescription.routes.js` - DELETE `/api/prescription/:id`
```sql
DELETE FROM PRESCRIPTIONITEM 
WHERE PRESCRIPTIONID = :id
```
**Purpose:** Remove all items (before deleting prescription)

---

### 8.8 Delete Prescription
**File:** `routes/prescription.routes.js` - DELETE `/api/prescription/:id`
```sql
DELETE FROM PRESCRIPTION 
WHERE PRESCRIPTIONID = :id
```
**Purpose:** Remove prescription header

---

## 9. MEDICAL RECORDS (5 queries)

### 9.1 Get All Medical Records
**File:** `routes/medicalrecords.routes.js` - GET `/api/medicalrecords`
```sql
SELECT r.RECORDID,
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
**Purpose:** Display patient medical history

---

### 9.2 Get Single Medical Record
**File:** `routes/medicalrecords.routes.js` - GET `/api/medicalrecords/:id`
```sql
SELECT r.RECORDID,
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
```
**Purpose:** View specific medical record

---

### 9.3 Generate Record ID
**File:** `routes/medicalrecords.routes.js` - POST `/api/medicalrecords`
```sql
SELECT NVL(MAX(RECORDID), 0) + 1 as NEXT_ID 
FROM MEDICALRECORD
```
**Purpose:** Auto-generate next record ID

---

### 9.4 Create Medical Record
**File:** `routes/medicalrecords.routes.js` - POST `/api/medicalrecords`
```sql
INSERT INTO MEDICALRECORD (RECORDID, APPOINTMENTID, VISITDATE, SYMPTOM, DIAGNOSIS)
VALUES (:recordid, :appointmentid, TO_DATE(:visitdate, 'YYYY-MM-DD'), :symptom, :diagnosis)
```
**Purpose:** Record patient visit and diagnosis

---

### 9.5 Update Medical Record
**File:** `routes/medicalrecords.routes.js` - PUT `/api/medicalrecords/:id`
```sql
UPDATE MEDICALRECORD
SET APPOINTMENTID = :appointmentid,
    VISITDATE = TO_DATE(:visitdate, 'YYYY-MM-DD'),
    SYMPTOM = :symptom,
    DIAGNOSIS = :diagnosis
WHERE RECORDID = :id
```
**Purpose:** Edit medical record

---

### 9.6 Delete Medical Record
**File:** `routes/medicalrecords.routes.js` - DELETE `/api/medicalrecords/:id`
```sql
DELETE FROM MEDICALRECORD 
WHERE RECORDID = :id
```
**Purpose:** Remove medical record

---

## 10. MEDICINE (5 queries)

### 10.1 Get All Medicines
**File:** `routes/medicine.routes.js` - GET `/api/medicine`
```sql
SELECT MEDICINEID as MEDICINE_ID,
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
```
**Purpose:** Display medicine inventory

---

### 10.2 Add Medicine
**File:** `routes/medicine.routes.js` - POST `/api/medicine`
```sql
INSERT INTO MEDICINE
  (MEDNAME, MEDPOSTINGDATE, MEDEXPIRYDATE, MEDDOSAGEFORM, 
   MEDDESCRIPTION, MEDPRICE, CURRENTSTOCK, MANUFACTURER, SIDEEFFECTS)
VALUES
  (:name, TO_DATE(:postingDate, 'YYYY-MM-DD'), TO_DATE(:expiryDate, 'YYYY-MM-DD'), 
   :dosageForm, :description, :price, :currentStock, :manufacturer, :sideEffects)
RETURNING MEDICINEID INTO :id
```
**Purpose:** Add new medicine to inventory

---

### 10.3 Get Single Medicine
**File:** `routes/medicine.routes.js` - GET `/api/medicine/:id`
```sql
SELECT MEDICINEID as MEDICINE_ID,
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
WHERE MEDICINEID = :id
```
**Purpose:** View medicine details

---

### 10.4 Update Medicine
**File:** `routes/medicine.routes.js` - PUT `/api/medicine/:id`
```sql
UPDATE MEDICINE
SET MEDNAME = :name,
    MEDPOSTINGDATE = TO_DATE(:postingDate, 'YYYY-MM-DD'),
    MEDEXPIRYDATE = TO_DATE(:expiryDate, 'YYYY-MM-DD'),
    MEDDOSAGEFORM = :dosageForm,
    MEDDESCRIPTION = :description,
    MEDPRICE = :price,
    CURRENTSTOCK = :currentStock,
    MANUFACTURER = :manufacturer,
    SIDEEFFECTS = :sideEffects
WHERE MEDICINEID = :id
```
**Purpose:** Edit medicine information

---

### 10.5 Delete Medicine
**File:** `routes/medicine.routes.js` - DELETE `/api/medicine/:id`
```sql
DELETE FROM MEDICINE 
WHERE MEDICINEID = :id
```
**Purpose:** Remove medicine from inventory

---

## 11. INVOICES (6 queries)

### 11.1 Get All Invoices
**File:** `routes/invoice.routes.js` - GET `/api/invoice`
```sql
SELECT i.INVOICEID,
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
```
**Purpose:** Display billing history with payment status

---

### 11.2 Get Single Invoice
**File:** `routes/invoice.routes.js` - GET `/api/invoice/:id`
```sql
SELECT i.INVOICEID,
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
```
**Purpose:** View detailed invoice

---

### 11.3 Calculate Medicine Cost (for Invoice)
**File:** `routes/invoice.routes.js` - POST `/api/invoice`
```sql
SELECT NVL(SUM(pi.QUANTITY * m.MEDPRICE), 0) as MEDICINE_COST
FROM PRESCRIPTION p
JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
JOIN PRESCRIPTIONITEM pi ON p.PRESCRIPTIONID = pi.PRESCRIPTIONID
JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
WHERE r.APPOINTMENTID = :appointmentid
```
**Purpose:** Calculate total medicine cost for automatic invoicing

---

### 11.4 Create Invoice
**File:** `routes/invoice.routes.js` - POST `/api/invoice`
```sql
INSERT INTO INVOICE (APPOINTMENTID, TOTALAMOUNT, PAYMENTMETHOD, DATEPAID)
VALUES (:appointmentid, :totalamount, :paymentmethod, :datepaid)
RETURNING INVOICEID INTO :invoiceid
```
**Purpose:** Generate new invoice

---

### 11.5 Update Invoice
**File:** `routes/invoice.routes.js` - PUT `/api/invoice/:id`
```sql
UPDATE INVOICE
SET TOTALAMOUNT = :totalamount,
    PAYMENTMETHOD = :paymentmethod,
    DATEPAID = :datepaid
WHERE INVOICEID = :id
```
**Purpose:** Edit invoice (mark as paid)

---

### 11.6 Delete Invoice
**File:** `routes/invoice.routes.js` - DELETE `/api/invoice/:id`
```sql
DELETE FROM INVOICE 
WHERE INVOICEID = :id
```
**Purpose:** Remove invoice

---

### 11.7 Get Prescription Cost Breakdown
**File:** `routes/invoice.routes.js` - GET `/api/invoice/appointment/:id/prescription-cost`
```sql
SELECT NVL(SUM(pi.QUANTITY * m.MEDPRICE), 0) as MEDICINE_COST,
       COUNT(DISTINCT p.PRESCRIPTIONID) as PRESCRIPTION_COUNT,
       COUNT(pi.PRESCRIPTIONITEMID) as MEDICINE_COUNT
FROM PRESCRIPTION p
JOIN MEDICALRECORD r ON p.RECORDID = r.RECORDID
LEFT JOIN PRESCRIPTIONITEM pi ON p.PRESCRIPTIONID = pi.PRESCRIPTIONID
LEFT JOIN MEDICINE m ON pi.MEDICINEID = m.MEDICINEID
WHERE r.APPOINTMENTID = :id
```
**Purpose:** Get detailed cost breakdown with item counts

---

## 12. DATABASE TEST (1 query)

### 12.1 Test Database Connection
**File:** `routes/testdb.routes.js` - GET `/api/test/db`
```sql
SELECT SYSDATE FROM DUAL
```
**Purpose:** Health check - verify database connectivity

---

## 13. CUSTOM QUERIES (1 dynamic)

### 13.1 Execute Custom SQL
**File:** `routes/query.routes.js` - POST `/api/query`
```sql
-- Any SELECT, INSERT, UPDATE, DELETE query
-- User-provided query with security restrictions
```
**Purpose:** Admin console for custom reports and maintenance queries

**Security Restrictions:**
- Blocks: DROP DATABASE, DROP USER, CREATE USER, ALTER USER, GRANT, REVOKE
- Detects query type: SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, DROP
- Returns appropriate response based on query type

---

## Summary Statistics

| Category | Count |
|----------|-------|
| **Total Queries** | 74 |
| **SELECT Queries** | 44 |
| **INSERT Queries** | 14 |
| **UPDATE Queries** | 11 |
| **DELETE Queries** | 14 |
| **Tables** | 11 |
| **Complex Queries** | 10 (with JOINs, Aggregates, Transactions) |
| **Transactions** | 2 (Prescription Create/Delete) |

---

## Query Complexity Breakdown

### Simple Queries (Single Table)
- Basic CRUD operations on single tables
- Direct INSERT, UPDATE, DELETE by ID
- Simple SELECT with WHERE clause

### Moderate Queries (2-3 Tables)
- JOINs between 2-3 related tables
- LEFT JOIN for optional relationships
- String concatenation

### Complex Queries (4+ Tables or Advanced Features)
1. Appointment listing (5 tables)
2. Prescription history (4 tables)
3. Medical records (4 tables)
4. Invoice listing (4 tables)
5. Aggregate functions (COUNT, SUM, MAX)
6. Transactions (Multiple DML operations)
7. Subqueries for calculations
8. RETURNING clause for generated IDs

---

## Security Features

✅ **Parameterized Queries** - All queries use `:parameter` syntax to prevent SQL injection  
✅ **Transaction Support** - ACID compliance with commit/rollback  
✅ **Query Restrictions** - Custom query endpoint blocks dangerous operations  
✅ **Date Handling** - TO_DATE ensures proper date format validation  
✅ **NULL Handling** - NVL prevents NULL errors in calculations
